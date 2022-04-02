import { useCallback} from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { usePlainData, api } from './Data.js';


export function LoginModal({data, dispatch, visible, handleClose}) {
    const formData = usePlainData({
        emailAddress: '', password: ''
    });

    const login = useCallback(() => {
        dispatch(api.user.login(formData.emailAddress, formData.password));
        formData.clear();
        handleClose();
    }, [dispatch, formData]);

    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Log In</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Email address:</Form.Label>
                        <Col>
                            <Form.Control type="email"
                                value={formData.emailAddress} onChange={formData.setEmailAddressFromInput}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Password:</Form.Label>
                        <Col>
                            <Form.Control type="password"
                                value={formData.password} onChange={formData.setPasswordFromInput}/>
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
