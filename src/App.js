import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/general.css';
import './styles/colors.css';

import {
    BrowserRouter as Router,
    Routes, Route, NavLink, useNavigate
} from "react-router-dom";

import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

import { useAppData } from './Data.js';

import { LoginModal } from './LoginModal.js';
import { UserFeedView, UserCalendarView } from './UserViews.js';
import { GroupFeedView, GroupCalendarView, GroupMemberView } from './GroupViews.js';

/* TODO:
    * Write unipalette bootstrap theme thing
    * Sign up flow
*/

function Header({showLogin, data}) {
    let navigate = useNavigate();
    return (<>
        <Navbar sticky="top" bg="light" expand="sm" className="row main-shade2-bg">
            <Container>
                <Navbar.Brand as={NavLink} to="/">CommonAgenda</Navbar.Brand>
                <Navbar.Toggle/>
                <Navbar.Collapse>
                    <Nav className="sm-auto">
                        {data.user ?
                            <>
                                <Nav.Link>New Group</Nav.Link>
                                <NavDropdown className="isplay-sm" title="My Groups">
                                    {data.user.groups.map(group => (
                                        <NavDropdown.Item key={group.id}>
                                            <img style={{marginRight: '0.5rem'}} src={group.iconSrc}/>
                                            <NavLink to={"/group/" + group.id}>{group.name}</NavLink>
                                        </NavDropdown.Item>
                                    ))}
                                </NavDropdown>
                                <Nav.Link as={NavLink} to="/user-cal">My Calendar</Nav.Link>
                                <div className="nav-profile profile-md display-sm">
                                    <img src={data.user.avatarSrc}/>
                                    <Nav.Link as={NavLink} to="/">{data.user.name}</Nav.Link>
                                </div>
                                <Nav.Link onClick={() => { data.logout(); navigate('/'); }}>Sign Out</Nav.Link>
                            </>
                            :
                            <>
                                <Nav.Link>Sign Up</Nav.Link>
                                <Nav.Link onClick={showLogin}>Log In</Nav.Link>
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
                <h4> Try CommonAgenda!</h4>
                <p>We can help you put your ducks in a row, keeping your group's schedule organized and efficient.</p>
            </div>
        </div>
    );
}

function App() {
    const data = useAppData();

    const [loginVisible, setLoginVisible] = useState(false);

    return (
        <Router>
            <div className="container">
                <Header data={data}
                        showLogin={() => setLoginVisible(true)}/>

                <div className="row mt-3">
                    <Routes>
                        <Route exact path="/" element={!data.user ? <AboutPage/>
                                                                      : <UserFeedView user={data.user}/>}/>
                        {data.user && (<>
                            <Route path="/user-cal" element={<UserCalendarView user={data.user}/>}/>
                            <Route path="/group/:id" element={<GroupFeedView/>}/>
                            <Route path="/group/:id/cal" element={<GroupCalendarView/>}/>
                            <Route path="/group/:id/members" element={<GroupMemberView/>}/>
                            </>
                        )}
                    </Routes>
                </div>

                <LoginModal data={data} visible={loginVisible} handleClose={() => setLoginVisible(false)}/>

                <Footer/>
            </div>
        </Router>
    );
}

export default App;
