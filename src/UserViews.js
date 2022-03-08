import React from 'react';
import { Link } from 'react-router-dom';
import { useUserEvents } from './Data.js';
import { CalendarView } from './CalendarView.js';

// Generic user-focused view with the user-oriented sidebar to the left and element component to the right
// the `element` function will be called with the user event data object as a prop
function UserView({user, element}) {
    const events = useUserEvents();

    return (
        <>
        <div className="col col-sm-5 col-md-4 col-xl-2 sidebar no-display-sm">
            <div className="profile-md">
                <img src={user.avatarSrc}/>
                <Link className="text" to="/">{user.name}</Link>
            </div>
            <hr className="main-shade-bordar"/>
            <ul className="group-list">
                {user.groups.map(group => (
                    <li key={group.id}>
                        <img src={group.iconSrc}/>
                        <Link to={"/group/" + group.id}>{group.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
        <div className="container col">
            {React.createElement(element, {data: events})}
        </div>
        </>
    );
}
export function UserFeedView({user}) {
    return (<UserView user={user} element={() => "feed"}/>);
}

export function UserCalendarView({user}) {
    return (<UserView user={user} element={CalendarView}/>);
}
