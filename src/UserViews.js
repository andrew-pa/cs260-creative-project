import {useMemo} from 'react';
import { Link } from 'react-router-dom';
import { api } from './Data.js';
import { CalendarView } from './CalendarView.js';
import { Feed } from './FeedView.js';

// Generic user-focused view with the user-oriented sidebar to the left and element component to the right
// the `element` function will be called with the user event data object as a prop
function UserView({data, dispatch, element, modalVisiblity}) {
    const events = useMemo(() => data.groups
        .filter(group => group.userIsMember)
        .map(group => {
            if(group.loaded)
                return group.events;
            else {
                if(!group.loading) {
                    console.log(group);
                    dispatch(api.groups.load(), group._id);
                }
                return [];
            }
        })
        .flat(),
    [data, dispatch]);

    if(!data) return <div></div>;

    return (
        <>
        <div className="col col-sm-3 col-md-3 col-xl-2 sidebar no-display-sm">
            <div className="profile-md">
                <img src={`/upload/${data.profile.profilePicture}`}/>
                <Link className="text" to="/">{data.profile.name}</Link>
            </div>
            <hr className="main-shade-bordar"/>
            <ul className="group-list">
                {data.groups
                    .filter(group => group.userIsMember)
                    .map(group => (
                    <li key={group._id}>
                        {/*<img src={group.iconSrc}/>*/}
                        <Link to={"/group/" + group._id}>{group.name}</Link>
                    </li>
                ))}
                <li><Link onClick={modalVisiblity.toggleNewGroup} to="#">Create new group...</Link></li>
            </ul>
        </div>
        <div className="container col row no-gutters">
            {element(events, data, dispatch)}
        </div>
        </>
    );
}

export function UserFeedView(props) {
    return (
        <UserView element={(events) => <Feed events={events} data={props.data} dispatch={props.dispatch}/>} {...props}/>
    );
}

export function UserCalendarView(props) {
    return (<UserView element={(events) => <CalendarView events={events}/>} {...props}/>);
}
