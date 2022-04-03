import { useCallback, useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePlainData, api } from './Data.js';

// TODO: disable button until form is filled
export function NewGroupModal({visible, handleClose, data, dispatch}) {
    const f = usePlainData({
        name: '',
        desc: '',
        image: null
    });

    const navigate = useNavigate();

    const createGroup = useCallback(() => {
        const img = new FormData();
        img.append('img', f.image, f.image.name);
        f.image = img;
        dispatch(api.groups.create(f, id => navigate(`/group/${id}`)));
        f.clear();
        handleClose();
    }, [data, navigate, f]);

    return (
        <Modal show={visible} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New Group</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container">
                    <Form.Group as={Row} className="mb-3">
                        <Form.Control type="text" placeholder="Name" value={f.name} onChange={f.setNameFromInput}/>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Picture:</Form.Label>
                        <Col>
                            <Form.Control type="file"
                                onChange={(e) => f.setImage(e.target.files[0])}/>
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
                <Button variant="primary" onClick={createGroup} /*className="accent-tint-bg accent-tint2-border"*/>Create Group!</Button>
            </Modal.Footer>
        </Modal>
    );
 
}
