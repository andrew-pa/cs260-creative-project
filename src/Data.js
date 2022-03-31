import { useReducer, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// `useData` is a general purpose data-store hook
// The createAPI function returns an object with the functions that will be added to the data object returned from `useData` These are API functions that modify or process data in some way.
// After finishing whatever processing, these functions should eventually call `dispatch` with a message array that tells the reducer how to change the state
// `messageHandlers` contains a number of member functions that will respond to dispatched messages to the reducer
// The first element in a message array is the name of a function in this object,
// the rest of the elements of the array are passed as arguments to the member function
// these functions only return the state that they have modified, and it is merged afterwards with the old state
export function useData(initialData, createAPI, messageHandlers, createAPIClosure) {
    const [data, dispatch] = useReducer(
        function(oldState, msg) {
            const handler = messageHandlers[msg[0]];
            if(!handler) throw msg;
            return {
                ...oldState,
                ...(handler.apply(oldState, msg.slice(1)))
            };
        },
        initialData
    );

    const apiFuncs = useMemo(() => {
        let apis = createAPI(dispatch);
        for(var api of Object.keys(apis)) {
            apis[api] = apis[api].bind(data);
        }
        return apis;
    }, [dispatch, createAPI, ...(createAPIClosure||[])]);

    return {...data, ...apiFuncs, _dispatch: dispatch};
}

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

    const objectProps = Object.keys(data);

    const api = useMemo(() => {
        let b = {};
        for(let prop of objectProps) {
            b[`set${prop[0].toUpperCase() + prop.substr(1)}`] = (val) => dispatch([prop, val]);
            b[`set${prop[0].toUpperCase() + prop.substr(1)}FromInput`] = (e) => dispatch([prop, e.target.value]);
        }
        b.clear = () => dispatch('clear');
        return b;
    }, [objectProps, dispatch]);

    return {...data, ...api};
}



function makeMockProfile(name) {
    return {
        id: 'user:'+name,
        name,
        avatarSrc: '/images/avatar.png',
    };
}

/// The main data-store hook for the user profile and other app global data. should only happen once in <App/>
export function useAppData() {
    const data = useData(
        { user: null },
        dispatch => ({
            async login(emailAddress, password) {
                const session = await axios.post('/api/login', { emailAddress, password });
                dispatch(['updateSession', session.data]);
            },
            async logout() {
                await axios.post('/api/logout');
                dispatch(['updateSession', null]);
                window.location = '/';
            },
            async register(form) {
                const session = await axios.post('/api/register', form);
                dispatch(['updateSession', session.data]);
            },
            async testSessionCookie() {
                if(this.user == null) {
                    const session = await axios.get('/api/user');
                    if(session.data != 'invalid') {
                        dispatch(['updateSession', session.data]);
                    }
                }
            }
        }),
        {
            updateSession: user => {
                console.log('updating session: ', user);
                return ({ user });
            },
        }
    );

    useEffect(async () => {
        await data.testSessionCookie();
    }, [data]);

    return data;
}

let mockEvents = [
    {
        id: 'e1', title: 'Weekly Goose Watch', date: new Date('2022-3-10 10:00:00'),
        groupId: 'group3', author: makeMockProfile('Greg Goobanik'),
        imgSrc: '/images/goose1.jpg',
        desc: 'Come see some lovely geese with us at Everest Park'
    },
    {
        id: 'e6', title: 'Weekly Goose Watch', date: new Date('2022-3-17 10:00:00'),
        groupId: 'group3', author: makeMockProfile('Greg Goobanik'),
        imgSrc: '/images/goose1.jpg',
        desc: 'Come see some lovely geese with us at Everest Park'
    },
    {
        id: 'e7', title: 'Weekly Goose Watch', date: new Date('2022-3-24 10:00:00'),
        groupId: 'group3', author: makeMockProfile('Greg Goobanik'),
        imgSrc: '/images/goose1.jpg',
        desc: 'Come see some lovely geese with us at Everest Park'
    },
    {
        id: 'e8', title: 'Weekly Goose Watch', date: new Date('2022-3-31 10:00:00'),
        groupId: 'group3', author: makeMockProfile('Greg Goobanik'),
        imgSrc: '/images/goose1.jpg',
        desc: 'Come see some lovely geese with us at Everest Park'
    },
    {
        id: 'e2', title: 'Family Reunion', date: new Date('2022-3-13 13:00:00'),
        groupId: 'group2', author: makeMockProfile('Bob Douglas'),
        desc: 'Calling all Douglases! Meet up at Aunt Judy\'s house'
    },
    {
        id: 'e3', title: 'Admin Meeting', date: new Date('2022-3-13 21:30:00'),
        groupId: 'group3', author: makeMockProfile('Greg Goobanik'),
        desc: 'Come discuss the important business of our club. Elections are coming up!'
    },
    {
        id: 'e4', title: 'Game Night', date: new Date('2022-3-23 20:00:00'),
        groupId: 'group1', author: makeMockProfile('Quinn Stephens'),
        imgSrc: '/images/game.jpg',
        desc: "If you like to play games, you won't want to miss this month's game night!"
    },
    {
        id: 'e9', title: 'Game Night', date: new Date('2022-4-20 20:00:00'),
        groupId: 'group1', author: makeMockProfile('Quinn Stephens'),
        imgSrc: '/images/game.jpg',
        desc: "If you like to play games, you won't want to miss this month's game night!"
    },
    {
        id: 'e5', title: 'All You Can Eat Wednesday', date: new Date('2022-4-6 17:00:00'),
        groupId: 'group4', author: makeMockProfile('Kevin Roberts'),
        desc: 'Come scarf down as much pizza as you can get you hands on!'
    },
    {
        id: 'e10', title: 'Richard\'s Birthday', date: new Date('2022-4-19 13:00:00'),
        groupId: 'group2', author: makeMockProfile('Richard Douglas'),
        desc: 'Happy birthday to me!'
    }
];

export function useUserEvents(userProfile) {
    const data = useData(
        { events: [], loaded: false },
        dispatch => ({
            async load() {
                if(!this.loaded) {
                    const events = await axios.get('/api/user/events');
                    dispatch(['load', events.data]);
                }
            }
        }),
        { load: events => ({events, loaded: true}) }
    );

    useEffect(async () => await data.load(), [data]);

    return data;
}

const mockGroups = {
    group1: {
        name: '4096th YSA Ward',
        iconSrc: '#', titleImgSrc: '/images/friends1.jpg',
        desc: 'The 4096th YSA Ward group calendar. Subscribe to keep up with upcoming activities and events in the ward!'
    },
    group2: {
        name: 'Douglas Family',
        iconSrc: '#', titleImgSrc: '/images/family1.jpg',
        desc: ''
    },
    group3: {
        name: 'Goose Watching Club',
        iconSrc: '#', titleImgSrc: '/images/goose2.jpg',
        desc: ' Could anything be more fun than watching geese? We watch geese weekly, come join us!'
    },
    group4: {
        name: 'Kevin\'s Pizza',
        iconSrc: '#', titleImgSrc: '/images/pizza1.jpg',
        desc: 'Kevin\'s world-famous pizza! Come by and have a slice!'
    }
};

export function useGroupData(id) {
    const data = useData(
        { },
        dispatch => ({
            async load(id) {
                const data = await axios.get(`/api/group/${id}`);
                dispatch(['loadData', data.data]);
            },

            async addEvent(title, date, desc, user) {
                dispatch(['createEvent', title, date, desc, user]);
            }
        }),
        {
            loadData(newData) {
                return newData;
            },
            createEvent(title, date, desc, author) {
                let newEvent = { id: `e:${title}`, title, date, groupId: id, desc, author };
                if(!mockEvents.find(e => e.id == newEvent.id))
                    mockEvents.push(newEvent);
                return {
                    events: [ newEvent, ...this.events ]
                };
            }
        }
    );

    useEffect(async () => {
        await data.load(id);
    }, [id, data]);

    return data;
}

const mockGroupMembers = {
    group1: [
        makeMockProfile('John Douglas'),
        makeMockProfile('Quinn Stephens'),
        makeMockProfile('Kate Rodgers'),
        makeMockProfile('Mary Stevens'),
        makeMockProfile('George Hoobleck'),
    ],
    
    group2: [
        makeMockProfile('John Douglas'),
        makeMockProfile('Bob Douglas'),
        makeMockProfile('Randy Douglas'),
        makeMockProfile('Rachel Douglas'),
        makeMockProfile('Richard Douglas'),
        makeMockProfile('Madison Douglas'),
        makeMockProfile('Judy Douglas'),
    ],

    group3: [
        makeMockProfile('John Douglas'),
        makeMockProfile('Greg Goobanik'),
        makeMockProfile('Laura Goobanik'),
        makeMockProfile('George Hoobleck'),
        makeMockProfile('Hunter Roberts'),
        makeMockProfile('Kate Rodgers'),
    ],

    group4: [
        makeMockProfile('John Douglas'),
        makeMockProfile('Laura Goobanik'),
        makeMockProfile('Hunter Roberts'),
        makeMockProfile('Madison Douglas'),
        makeMockProfile('Quinn Stephens'),
        makeMockProfile('Kevin Roberts'),
    ]

};

export function useGroupMemberData(id) {
    const data = useData(
        { members: [] },
        dispatch => ({
            async load(id) {
                const members = await axios.get(`/api/group/${id}/members`);
                dispatch(['load', members.data]);
            }
        }),
        {
            load(members) { return { members }; }
        }
    );

    useEffect(async () => {
        await data.load(id);
    }, [id, data]);

    return data;
}
