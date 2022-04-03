import { useState, useEffect, useCallback } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/general.css';
import './styles/colors.css';

import {
    BrowserRouter as Router,
    Routes, Route, NavLink, useNavigate, Link
} from "react-router-dom";

import { Navbar, Nav, NavDropdown, Container, Form, FormControl } from 'react-bootstrap';

import { useAppData, usePlainData, api } from './Data.js';

import { LoginModal } from './LoginModal.js';
import { RegisterModal } from './RegisterModal.js';
import { NewGroupModal } from './NewGroupModal.js';
import { UserFeedView, UserCalendarView } from './UserViews.js';
import { GroupFeedView, GroupCalendarView, GroupMemberView } from './GroupViews.js';

/* TODO:
    * Write unipalette bootstrap theme thing
    * Image upload
*/

function GroupSearchBox({data, dispatch}) {
    const [query, setQuery] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        dispatch(api.groups.search(query));
    }, [query]);

    const onKeyDown = useCallback((e) => {
        if(e.key == 'Enter' && data.searchResults.length > 0) {
            e.preventDefault();
            setQuery('');
            navigate(`/group/${data.searchResults[0]._id}`);
        }
    }, [data, navigate]);


    return (
        <>
        <Form className="d-flex">
            <FormControl type="search" placeholder="Search for groups..." className="me-2" style={{alignSelf: 'center'}}
            value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={onKeyDown}/>
        </Form>

        {data.searchResults.length > 0 && <div className="search-results main-bg">
            {data.searchResults.map(({_id, name}) => <Link key={_id} to={`/group/${_id}`} onClick={() => setQuery('')}>{name}</Link>)}
        </div>}
        </>
    );
}

function Header({data, dispatch, modalVisiblity}) {
    let navigate = useNavigate();
    return (<>
        <Navbar sticky="top" bg="light" expand="sm" className="row main-shade2-bg">
            <Container>
                <Navbar.Brand as={NavLink} to="/">CommonAgenda</Navbar.Brand>
                <Navbar.Toggle/>
                <Navbar.Collapse>
                    <Nav className="sm-auto">
                        {data.profile.loggedIn ?
                            <>
                            <GroupSearchBox data={data} dispatch={dispatch}/>
                            <NavDropdown title="Groups">
                                    {data.groups
                                        .filter(group => group.userIsMember)
                                        .map(group => (
                                            <NavDropdown.Item key={group._id} as={NavLink} to={`/group/${group._id}`}>
                                                <img style={{marginRight: '0.5rem'}} src={group.iconSrc}/>
                                                <span>{group.name}</span>
                                            </NavDropdown.Item>
                                        ))}
                                    <NavDropdown.Item onClick={modalVisiblity.toggleNewGroup}>Create New Group...</NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link as={NavLink} to="/user-cal">Calendar</Nav.Link>
                                <div className="nav-profile profile-md display-sm">
                                    <img src={data.profile.profilePicture}/>
                                    <Nav.Link as={NavLink} to="/">{data.profile.name}</Nav.Link>
                                </div>
                                <Nav.Link onClick={() => { dispatch(api.user.logout()); navigate('/'); }}>Sign Out</Nav.Link>
                            </>
                            :
                            <>
                                <Nav.Link onClick={modalVisiblity.toggleRegister}>Sign Up</Nav.Link>
                                <Nav.Link onClick={modalVisiblity.toggleLogin}>Log In</Nav.Link>
                            </>}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>);
}

function Footer() {
    return (
        <div className="row footer justify-content-center">
            <hr className="main-shade-border"/>
            <p className="col"><i>By Andrew & James Palmer</i></p>
            <a className="col text" style={{textAlign: "right"}} href="https://github.com/andrew-pa/cs260-creative-project">View Source on Github</a>
        </div>
    );
}

function AboutPage() {
    return (
        <div className="row" style={{marginTop: "1.5em"}}>
            <div className="col">
                <img className="col" style={{width: '100%'}} src="/images/office.jpg"/>
            </div>
            <div className="col">
                <h3>Ever feel like you're having a hard time getting people together?</h3>
                <h4>Try CommonAgenda!</h4>
                <p>We can help you put your ducks in a row, keeping your group's schedule organized and efficient.</p>
            </div>
        </div>
    );
}

function App() {
    const [data, dispatch] = useAppData();

    const modalVisiblity = usePlainData({
        login: false, register: false, newGroup: false
    });

    const [sessionTested, setSessionTested] = useState(false);

    useEffect(() => {
        if(!data.loggedIn && !data.loginPending && !sessionTested) {
            dispatch(api.user.testSession());
            setSessionTested(true);
        }
    }, [data, sessionTested]);

    return (
        <Router>
            <div className="container">
                <Header data={data} dispatch={dispatch} modalVisiblity={modalVisiblity}/>

                <div className="row mt-3">
                    <Routes>
                        <Route exact path="/" element={!data.profile.loggedIn ? <AboutPage/> : <UserFeedView data={data} dispatch={dispatch} modalVisiblity={modalVisiblity}/>}/>
                        {data.profile.loggedIn && (<>
                            <Route path="/user-cal" element={<UserCalendarView data={data} dispatch={dispatch}/>}/>
                            <Route path="/group/:id" element={<GroupFeedView data={data} dispatch={dispatch}/>}/>
                            <Route path="/group/:id/cal" element={<GroupCalendarView data={data} dispatch={dispatch}/>}/>
                            <Route path="/group/:id/members" element={<GroupMemberView data={data} dispatch={dispatch}/>}/>
                            </>
                        )}
                    </Routes>
                </div>

                <LoginModal data={data} dispatch={dispatch} visible={modalVisiblity.login} handleClose={modalVisiblity.toggleLogin}/>
                <RegisterModal data={data} dispatch={dispatch} visible={modalVisiblity.register} handleClose={modalVisiblity.toggleRegister}/>
                <NewGroupModal data={data} dispatch={dispatch} visible={modalVisiblity.newGroup} handleClose={modalVisiblity.toggleNewGroup}/>

                <Footer/>
            </div>
        </Router>
    );
}

export default App;
