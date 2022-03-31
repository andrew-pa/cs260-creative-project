import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { usePlainData } from './Data.js';

export function EventForm({formData}) {
    return (
        <Form className="container">
            <Form.Group as={Row} className="mb-3">
                <Form.Control type="text" placeholder="Event Title" value={formData.title} onChange={formData.setTitleFromInput}/>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={2}>Date:</Form.Label>
                <Col><Form.Control type="datetime-local" value={formData.date} onChange={formData.setDateFromInput}/></Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Control as="textarea" value={formData.desc} onChange={formData.setDescFromInput}
                    placeholder="Event Description"/>
            </Form.Group>
        </Form>
    );
}

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
                <EventForm formData={f}/>
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
