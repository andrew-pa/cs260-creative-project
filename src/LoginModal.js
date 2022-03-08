import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

function updateStateFromTextInput(setState) {
    return e => {
        setState(e.target.value);
    };
}

export function LoginModal({data, visible, handleClose}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    function login() {
        data.login(username, password)
            .then(() => {
                setUsername('');
                setPassword('');
                handleClose();
            })
            .catch(err => {
                //TODO: show something nicer than an alert
                alert(err);
            });
    }

    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Log In</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Username:</Form.Label>
                        <Col>
                            <Form.Control type="text"
                                value={username} onChange={updateStateFromTextInput(setUsername)}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Password:</Form.Label>
                        <Col>
                            <Form.Control type="password"
                                value={password} onChange={updateStateFromTextInput(setPassword)}/>
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary" /*className="accent-tint-bg accent-tint2-border"*/
                    onClick={login}>Log In</Button>
            </Modal.Footer>
        </Modal>
    );
}
