import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { usePlainData } from './Data.js';

export function NewGroupModal({visible, handleClose}) {
    const f = usePlainData({
        title: '',
        desc: '',
        picture: ''
    });


    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New Group</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container">
                    <Form.Group as={Row} className="mb-3">
                        <Form.Control type="text" placeholder="Name" value={f.title} onChange={f.setTitleFromInput}/>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Picture:</Form.Label>
                        <Col>
                            <Form.Control type="file"
                                value={f.picture} onChange={f.setPictureFromInput}/>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Control as="textarea" value={f.desc} onChange={f.setDescFromInput}
                            placeholder="Description"/>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" /*className="accent-tint-bg accent-tint2-border"*/>Create Group!</Button>
            </Modal.Footer>
        </Modal>
    );
 
}
