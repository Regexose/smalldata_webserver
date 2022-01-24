// frontend/src/components/Modal.js

import React, { Component } from "react";
import {
 Button,
 Modal,
 ModalHeader,
 ModalBody,
 ModalFooter,
 Form,
 FormGroup,
 Input,
 Label
} from "reactstrap";

export default class CustomModal extends Component {
 constructor(props) {
   super(props);
   this.state = {
     activeItem: this.props.activeItem
   };
 }
 handleChange = e => {
   let { name, value } = e.target;
   if (e.target.type === "checkbox") {
     value = e.target.checked;
   }
   const activeItem = { ...this.state.activeItem, [name]: value };
   this.setState({ activeItem });
 };
 render() {
   const { toggle, onSave } = this.props;
   return (
     <Modal isOpen={true} toggle={toggle}>
       <ModalHeader toggle={toggle}> Create new utterance </ModalHeader>
       <ModalBody>
         <Form>
           <FormGroup>
             <Label for="text">Text</Label>
             <Input
               type="text"
               name="text"
               value={this.state.activeItem.text}
               onChange={this.handleChange}
               placeholder="Enter utterance here"
             />
           </FormGroup>
         </Form>
       </ModalBody>
       <ModalFooter>
         <Button color="success" onClick={() => onSave(this.state.activeItem)}>
           Save
         </Button>
       </ModalFooter>
     </Modal>
   );
 }
}
