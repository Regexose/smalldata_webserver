// frontend/src/components/Utterance.js

import React, { Component } from "react";
import Select from 'react-select';
import fetch from "node-fetch";
import { http_url } from '../App.js'


type State = {
    isDisabled: boolean,
    isLoading: boolean,
    isSearchable: boolean,
};

export default class TriggerCategory extends Component<*, State> {
    constructor(props) {
        super(props);
        this.state = {
            categoryID: null,
            options: []
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount(): void {
        fetch(http_url + "/categories", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(response => {
            (response.json().then(data => {
                this.parseCategories(data)
            }))
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        let ID = this.state.categoryID;
        fetch(http_url + "/categories/" + ID +  "/trigger", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        }).then(response => {
            (response.json().then(data => {
                alert('message: ' + data['message'])
            }))
        });
    }

    parseCategories(data) {
        this.setState({options:
                data.map(element => { return { label: element['name'], value: element['id'] } })
        })
    }

    handleChange(event) {
        this.setState({categoryID: event.value})
    }

    render() {
        const {
            isSearchable,
            isDisabled,
            isLoading,
        } = this.state;
        return (
            <form style={{width: 350}} onSubmit={this.handleSubmit}>
                <div className="row ">
                    <label>
                        Please select the category to send!
                    </label>
                </div>

                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                    isSearchable={isSearchable}
                    name="color"
                    options={this.state.options}
                    onChange={this.handleChange}
                />
                <div>
                    <input type="submit" value="Submit" />
                </div>
            </form>
        );
    }
}
