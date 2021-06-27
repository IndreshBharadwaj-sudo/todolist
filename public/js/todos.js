const button = document.getElementById('icon');
const mongoose = require('mongoose');
const Todo = require('../models/todo');
const express = require('express');

async function fn() {
    await Todo.deleteElementById(button.value);
}