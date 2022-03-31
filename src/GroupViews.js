import {React, useState, useMemo} from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGroupData, useGroupMemberData } from './Data.js';
import { CalendarView } from './CalendarView.js';
import { Feed } from './FeedView.js';
import { NewEventModal } from './NewEventModal.js';
import './styles/group.css';

// Generic user-focused view with the user-oriented sidebar to the left and element component to the right
// the `element` function will be called with the user event data object as a prop
function GroupView({element, showFeedLink, showCalLink, user}) {
    const id = useParams().id;
    const data = useGroupData(id);

    const userIsOwner = useMemo(() => data.owner === user.id, [data, user]);

    return (
        <>
        <div className="col col-sm-3 col-md-3 col-xl-2 sidebar">
            <div className="group-profile-md">
                <img src={data.titleImgSrc}/>
                <h1>{data.name}</h1>
                <p className="desc no-display-sm">{data.desc}</p>
            </div>
            <hr className="main-shade-border"/>
            <ul className="group-list">
                {showFeedLink && <li> <Link className="text" to={`/group/${id}`}>Group Feed</Link> </li>}
                {showCalLink && <li> <Link className="text" to={`/group/${id}/cal`}>Group Calendar</Link> </li>}
                <li> <Link className="text" to={`/group/${id}/members`}>Group Members</Link> </li>
                <li> <Link className="text" to="#">Invite to this group</Link> </li>
                <li> <Link className="text" to="#">Leave group</Link> </li>
                {userIsOwner && <li> <Link className="text" to="#">Delete this group</Link> </li>}
            </ul>
        </div>
        <div className="container col-sm row no-gutters">
            {element(data)}
        </div>
        </>
    );
}

export function GroupFeedView({user}) {
    const id = useParams().id;
    const [ newEventModalVisible, setNewEventModalVisible ] = useState(false);

    return (<>
        <GroupView element={(data) => data.events && <>
                 <Feed events={data.events.filter(event => event.groupId == id )} showCreateEvent={() => setNewEventModalVisible(true)}/>
                <NewEventModal visible={newEventModalVisible} handleClose={()=>setNewEventModalVisible(false)}
                    create={data.addEvent} author={user}/>
            </>}
            user={user}
            showFeedLink={false} showCalLink={true}/>
        </>
    );
}

export function GroupCalendarView({user}) {
    return (<GroupView element={(data) => data.events && <CalendarView events={data.events}/>} showFeedLink={true} showCalLink={false} user={user}/>);
}

function MemberList({id}) {
    const data = useGroupMemberData(id);

    return (
        <div className="col">
        <h2>Members</h2>
        <div className="profile-list">
            {data.members?.map(member => (
                <div className="mem-profile profile-md" key={member.id}>
                    <img src={member.avatarSrc}/>
                    <p>{member.name}</p>
                </div>
            ))}
        </div>
        </div>
    );
}

export function GroupMemberView() {
    return (<GroupView element={(data) => <MemberList id={data.id}/>} showFeedLink={true} showCalLink={true}/>);
}
