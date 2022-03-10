import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGroupData, useGroupMemberData } from './Data.js';
import { CalendarView } from './CalendarView.js';
import './styles/group.css';

// Generic user-focused view with the user-oriented sidebar to the left and element component to the right
// the `element` function will be called with the user event data object as a prop
function GroupView({element, showFeedLink, showCalLink}) {
    const id = useParams().id;
    const data = useGroupData(id);

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
            </ul>
        </div>
        <div className="container col-sm row no-gutters">
            {element(data)}
        </div>
        </>
    );
}

export function GroupFeedView() {
    return (<GroupView element={() => `feed`} showFeedLink={false} showCalLink={true}/>);
}

export function GroupCalendarView() {
    return (<GroupView element={(data) => data.events && <CalendarView events={data.events}/>} showFeedLink={true} showCalLink={false}/>);
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
