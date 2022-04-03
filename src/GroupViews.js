import {useState, useMemo, useEffect, useCallback} from 'react';
import { Spinner } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from './Data.js';
import { CalendarView } from './CalendarView.js';
import { Feed } from './FeedView.js';
import { NewEventModal } from './NewEventModal.js';
import './styles/group.css';

// Generic user-focused view with the user-oriented sidebar to the left and element component to the right
// the `element` function will be called with the user event data object as a prop
function GroupView({element, showFeedLink, showCalLink, data, dispatch}) {
    const groupId = useParams().id;

    const [group, userIsOwner, userIsMember] = useMemo(() => {
        let group = data.groups.find(group => group._id === groupId);
        if(!group) {
            dispatch({t: 'group_new', pending: false, result: {id: groupId}}); //create a place for the group to go
            group = {loaded:false};
        }
        return [group, group.owner === data.profile._id, group?.members?.find(mem => mem._id == data.profile._id) != null];
    }, [data, groupId]);

    useEffect(() => {
        if(!group.loaded && !group.loading) {
            dispatch(api.groups.load(), groupId);
        }
    }, [groupId]);

    const navigate = useNavigate();

    const joinGroup = useCallback(() => {
        dispatch(api.groups.join(), groupId);
    });

    const leaveGroup = useCallback(() => {
        dispatch(api.groups.leave(() => navigate('/')), groupId);
    });

    const deleteGroup = useCallback(() => {
        dispatch(api.groups.delete(groupId, () => navigate('/')));
    }, [groupId, navigate]);

    if(group.notFound) {
        return <div style={{textAlign: 'center'}}>This group does not exist</div>;
    }

    return (
        group.loaded ?
        <>
        <div className="col col-sm-3 col-md-3 col-xl-2 sidebar">
            <div className="group-profile-md">
                <img src={`/upload/${group.image}`}/>
                <h1>{group.name}</h1>
                <p className="desc no-display-sm">{group.desc}</p>
            </div>
            <hr className="main-shade-border"/>
            <ul className="group-list">
                {showFeedLink && <li> <Link className="text" to={`/group/${groupId}`}>Group Feed</Link> </li>}
                {showCalLink && <li> <Link className="text" to={`/group/${groupId}/cal`}>Group Calendar</Link> </li>}
                <li> <Link className="text" to={`/group/${groupId}/members`}>Group Members</Link> </li>
                {!userIsMember && <li> <Link className="text" to="#" onClick={joinGroup}>Join this group</Link> </li>}
                {userIsMember && <li> <Link className="text" to="#" onClick={leaveGroup}>Leave group</Link> </li>}
                {userIsOwner && <li> <Link className="text" to="#" onClick={deleteGroup}>Delete this group</Link> </li>}
            </ul>
        </div>
        <div className="container col-sm row no-gutters">
            {element(group, data, dispatch)}
        </div>
        </> : <div style={{display:'flex', justifyContent:'center', height: '50vh'}}><Spinner animation="border" role="status"/></div>
    );
}

export function GroupFeedView(props) {
    const id = useParams().id;
    const [ newEventModalVisible, setNewEventModalVisible ] = useState(false);

    return (<>
        <GroupView element={(group,data,dispatch) => group.events &&
            <>
                <Feed events={group.events} showCreateEvent={() => setNewEventModalVisible(true)} data={props.data} dispatch={props.dispatch}/>
                <NewEventModal visible={newEventModalVisible} handleClose={()=>setNewEventModalVisible(false)}
                    data={data} dispatch={dispatch} groupId={id}/>
            </>}
            {...props}
            showFeedLink={false} showCalLink={true}/>
        </>
    );
}

export function GroupCalendarView(props) {
    return (<GroupView element={(group,data,dispatch) => group.events && <CalendarView events={group.events}/>} showFeedLink={true} showCalLink={false} {...props}/>);
}

function MemberList({group}) {
    return (
        <div className="col">
        <h2>Members</h2>
        <div className="profile-list">
            {group.members?.map(member => (
                <div className="mem-profile profile-md" key={member._id}>
                    <img src={`/upload/${member.profilePicture}`}/>
                    <p>{member.name}</p>
                </div>
            ))}
        </div>
        </div>
    );
}

export function GroupMemberView(props) {
    return (<GroupView element={(group,data,dispatch) => <MemberList group={group}/>} showFeedLink={true} showCalLink={true} {...props}/>);
}
