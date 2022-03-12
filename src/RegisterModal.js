import { useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { usePlainData } from './Data.js';

export function RegisterModal({data, visible, handleClose}) {
    const formData = usePlainData({
        emailAddress: '',
        name: '',
        password: '',
        profilePic: ''
    });

    function register() {
        data.register(formData)
            .then(() => {
                formData.clear();
                handleClose();
            })
            .catch(err => alert(err));
    }

    const formValid = useMemo(() => {
        return formData.emailAddress.trim().length > 0
            && formData.name.trim().length > 0
            && formData.password.trim().length > 0
            && formData.profilePic.length > 0;
    }, [formData]);

    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Email:</Form.Label>
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

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Name:</Form.Label>
                        <Col>
                            <Form.Control type="text"
                                value={formData.name} onChange={formData.setNameFromInput}/>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Profile Picture:</Form.Label>
                        <Col>
                            <Form.Control type="file"
                                value={formData.profilePic} onChange={formData.setProfilePicFromInput}/>
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={register} disabled={!formValid}>Register!</Button>
            </Modal.Footer>
        </Modal>
    );
}

