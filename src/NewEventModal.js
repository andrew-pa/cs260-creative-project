import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { usePlainData } from './Data.js';

export function NewEventModal({create, visible, handleClose, author}) {
    const f = usePlainData({
        title: '',
        date: '',
        desc: ''
    });

    function createEvent() {
        create(f.title, new Date(f.date), f.desc, author).then(
            () => {
                f.clear();
                handleClose()
            }
        );
    }

    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New event...</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container">
                    <Form.Group as={Row} className="mb-3">
                        <Form.Control type="text" placeholder="Event Title" value={f.title} onChange={f.setTitleFromInput}/>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Date:</Form.Label>
                        <Col><Form.Control type="datetime-local" value={f.date} onChange={f.setDateFromInput}/></Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Control as="textarea" value={f.desc} onChange={f.setDescFromInput}
                            placeholder="Event Description"/>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                <Button variant="primary"
                    disabled={f.title.trim().length == 0 || f.date.trim().length == 0 || f.desc.trim().length == 0}
                    onClick={createEvent}>Create</Button>
            </Modal.Footer>
        </Modal>
    );
}
