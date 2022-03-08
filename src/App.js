import { useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/general.css';
import './styles/colors.css';

import {
    BrowserRouter as Router,
    Routes, Route, NavLink
} from "react-router-dom";

import { Navbar, Nav, Container } from 'react-bootstrap';

import { useAppData } from './Data.js';

import { LoginModal } from './LoginModal.js';
import { UserFeedView, UserCalendarView } from './UserViews.js';

/* TODO:
    * Make logout return to homepage if you're not there already
    * Write unipalette bootstrap theme thing
    * Sign up flow
*/

function Header({showLogin, data}) {
    return (<>
        <Navbar bg="light" expand="sm" className="row main-shade2-bg">
            <Container>
                <Navbar.Brand as={NavLink} to="/">CommonAgenda</Navbar.Brand>
                <Navbar.Toggle/>
                <Navbar.Collapse>
                    <Nav className="sm-auto">
                        {data.user ?
                            <>
                                <Nav.Link>New Group</Nav.Link>
                                <Nav.Link>My Groups</Nav.Link>
                                <Nav.Link as={NavLink} to="/user-cal">My Calendar</Nav.Link>
                                <div className="nav-profile profile-md display-sm">
                                    <img src={data.user.avatarSrc}/>
                                    <Nav.Link>{data.user.name}</Nav.Link>
                                </div>
                                <Nav.Link onClick={data.logout}>Sign Out</Nav.Link>
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
                        {data.user && (
                            <Route path="/user-cal" element={<UserCalendarView user={data.user}/>}/>
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