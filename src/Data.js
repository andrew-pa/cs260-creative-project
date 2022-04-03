import { useReducer, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export function usePlainData(initial) {
    const [data, dispatch] = useReducer(
        (oldState, msg) => {
            if(msg == 'clear') return initial;
            return {
                ...oldState,
                [msg[0]]: msg[1]
            };
        },
        initial
    );

    const objectProps = useMemo(() => Object.keys(data), [data]);

    const api = useMemo(() => {
        let b = {};
        for(let prop of objectProps) {
            b[`set${prop[0].toUpperCase() + prop.substr(1)}`] = (val) => dispatch([prop, val]);
            b[`set${prop[0].toUpperCase() + prop.substr(1)}FromInput`] = (e) => dispatch([prop, e.target.value]);
            b[`toggle${prop[0].toUpperCase() + prop.substr(1)}`] = () => dispatch([prop, !data[prop]]);
        }
        b.clear = () => dispatch('clear');
        return b;
    }, [objectProps, dispatch, data]);

    return {...data, ...api};
}

function applyReducerTree(reducerTree, oldState, msg, parentId) {
    // console.log('ART', reducerTree, oldState, msg);
    if(reducerTree == undefined) return oldState;
    var newState, idToMatch;
    if(Array.isArray(oldState)) {
        newState = oldState.map(
            s => {
                return applyReducerTree(reducerTree.element, s, msg, parentId);
            }
        );
        idToMatch = parentId;
    } else if(typeof(oldState) == 'object') {
        newState = {};
        for(var key of Object.keys(oldState)) {
            const reducers = reducerTree[key];
            if(reducers) {
                newState[key] = applyReducerTree(reducers, oldState[key], msg, oldState._id);
            } else {
                newState[key] = oldState[key];
            }
        }
        idToMatch = newState._id;
    } else {
        newState = oldState;
    }

    const dispatch = reducerTree['$'+msg.t];
    if(dispatch && (!msg.id || msg.id == idToMatch)) {
        newState = dispatch(newState, msg);
    }
    return newState;
}

function useReducerTree(initialData, reducerTree) {
    const [data, dispatch] = useReducer(
        (oldState, msg) => {
            console.log('sending message to state: ', msg);
            return applyReducerTree(reducerTree, oldState, msg)
        },
        initialData
    );

    const newDispatch = useCallback((msg, id) => {
        if(msg._fn) {
            dispatch({t: msg.t, pending: true, id});
            msg._fn(data, id, dispatch)
                .then(result => dispatch({t: msg.t, pending: false, result, id: result?.$id || id}))
                .catch(err => {
                    console.log(msg, err);
                    dispatch({t: msg.t, pending: false, error: err});
                });
        } else {
            dispatch(msg);
        }
    }, [data, dispatch]);

    return [data, newDispatch];
}

function makeAsyncApi(messageType, fn) {
    return (...args) => ({ t: messageType, _fn: (data,id,dispatch) => fn.apply({data,dispatch}, [...args, id]) }); //TODO: this is cursed, we should really pass the data first
}

function singleGroupReducers() {
    return {
        events: {
            element: {
                $event_edit(oldState, msg) {
                    if(msg.pending) return oldState;
                    return {
                        ...oldState,
                        title: msg.result.title,
                        datetime: msg.result.date,
                        description: msg.result.desc,
                        image: msg.result.image
                    };
                }
            },
            $event_new(oldState, msg) {
                if(msg.pending) return oldState;
                msg.result.datetime = new Date(msg.result.datetime);
                return [...oldState, msg.result];
            },
            $event_delete(oldState, msg) {
                if(msg.pending) return oldState;
                return oldState.filter(ev => ev._id != msg.result);
            }
        },
        members: {
            element: {},
        },
        $group_load(oldState, msg) {
            if(msg.pending) return {...oldState, loading: true};
            if(msg.error)
                return {...oldState, loading: false, loaded: true, notFound: msg.error.response.status == 404};
            const res = msg.result;
            return {
                ...oldState,
                loaded: true,
                loading: false,
                name: res.name,
                image: res.image,
                desc: res.description,
                owner: res.owner,
                members: res.members,
                events: res.events.map(ev => ({...ev, datetime: new Date(ev.datetime)}))
            };
        },
        $group_join(oldState, msg) {
            if(msg.pending) return oldState;
            return {
                ...oldState,
                userIsMember: true,
                members: [...oldState.members, msg.result.member]
            };
        },
        $group_leave(oldState, msg) {
            if(msg.pending) return oldState;
            console.log('GL', msg.id);
            return {
                ...oldState,
                userIsMember: false,
                members: oldState.members.filter(mem => mem._id != msg.result)
            };
        }
    };
}

export function useAppData() {
    const initialData = {
        profile: { loggedIn: false },
        groups: [],
        searchResults: []
    };
    return useReducerTree(
        initialData,
        {
            profile: { },
            groups: {
                element: singleGroupReducers(),
                $group_new(oldState, msg) {
                    if(msg.pending) return oldState;
                    const existingGroup = oldState.find(g => g._id == msg.result.id);
                    if(existingGroup) {
                        return oldState.map(g => g._id == msg.result.id ? {loaded:false, name:'', _id: msg.result.id} : g);
                    } else {
                        return [{_id: msg.result.id, name: '', iconSrc: '', loaded: false}, ...oldState];
                    }
                },
                $group_delete(oldState, msg) {
                    if(msg.pending || msg.error) return oldState;
                    return oldState.map(g => g._id == msg.result.groupId ? {loaded: true, notFound: true, _id: g._id} : g);
                }
            },
            searchResults: {
                elements: {},
                $group_search_res(oldState, msg) {
                    if(msg.pending) return oldState;
                    return msg.result;
                }
            },
            $user_login(oldState, msg) {
                if(msg.pending) return {...oldState, loginPending: true};
                return {
                    ...oldState,
                    loginPending: false,
                    profile: msg.result ? { _id: msg.result.id, name: msg.result.name, profilePicture: msg.result.profilePicture, loggedIn: true } : {loggedIn:false},
                    groups: msg.result ? msg.result.groups.map(group => ({...group, loaded: false, userIsMember: true})) : [],
                };
            },
            $user_logout(oldState, msg) {
                if(msg.pending) return oldState;
                return initialData;
            }
        }
    );
}

export const api = {
    user: {
        login: makeAsyncApi('user_login', async (emailAddress, password) => {
            return (await axios.post('/api/login', { emailAddress, password })).data;
        }),
        logout: makeAsyncApi('user_logout', async () => {
            await axios.post('/api/logout');
            return 1;
        }),
        testSession: makeAsyncApi('user_login', async () => {
            const session = (await axios.get('/api/user'));
            if(session.data != 'invalid') {
                return session.data;
            }
        }),
        register: makeAsyncApi('user_login', async (userInfo) => {
            const picId = (await axios.post('/api/upload/img', userInfo.profilePicture)).data;
            userInfo.profilePicture = picId;
            return (await axios.post('/api/register', userInfo)).data;
        })
    },
    groups: {
        load: makeAsyncApi('group_load', async (id) => {
            return (await axios.get(`/api/group/${id}`)).data;
        }),
        create: makeAsyncApi('group_new', async (groupInfo, groupIdCallback) => {
            const picId = (await axios.post('/api/upload/img', groupInfo.image)).data;
            groupInfo.image = picId;
            const id = (await axios.post('/api/group/new', groupInfo)).data;
            // console.log(`new group id = ${id}`);
            if(!id) throw 'failed to create group';
            groupIdCallback(id);
            return { id };
        }),
        delete: makeAsyncApi('group_delete', async (groupId, cb) => {
            await axios.delete(`/api/group/${groupId}`);
            cb();
            return { groupId };
        }),
        join: makeAsyncApi('group_join', async function(groupId) {
            await axios.put(`/api/group/${groupId}/members`);
            return {
                member: {
                    _id: this.data.profile._id,
                    name: this.data.profile.name,
                    profilePicture: this.data.profilePicture
                }
            };
        }),
        leave: makeAsyncApi('group_leave', async function(cb, groupId) {
            await axios.delete(`/api/group/${groupId}/members`);
            cb();
            return this.data.profile._id;
        }),
        search: makeAsyncApi('group_search_res', async function(query) {
            query = query.trim();
            if(query.length == 0) return [];
            return (await axios.get('/api/group/search', { params: { q: query } })).data;
        })
    },
    events: {
        create: makeAsyncApi('event_new', async (eventInfo, groupId) => {
            if(eventInfo.image) {
                const picId = (await axios.post('/api/upload/img', eventInfo.image)).data;
                eventInfo.image = picId;
            }
            return (await axios.post(`/api/group/${groupId}/events/new`, eventInfo)).data;
        }),
        edit: makeAsyncApi('event_edit', async (eventInfo, groupId, eventId) => {
            if(eventInfo.image) {
                const picId = (await axios.post('/api/upload/img', eventInfo.image)).data;
                eventInfo.image = picId;
            }
            await axios.put(`/api/group/${groupId}/events/${eventId}`, eventInfo);
            return eventInfo;
        }),
        delete: makeAsyncApi('event_delete', async (eventId, groupId) => {
            await axios.delete(`/api/group/${groupId}/events/${eventId}`);
            return eventId;
        })
    }
};

