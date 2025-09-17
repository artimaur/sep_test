const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('./database');

// Route: GET all students
const getdata = async (req, res) => {
    try {
        const [students] = await pool.query('select * from students');
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const insertdata = (async (req, res) => {
    try {
        const { name, age, class: studentClass } = req.body;
        if (!name || name.length < 3) {
            return res.status(400).json({ success: false, message: "Name will be atleast 3 letter" });
        }
        if (!age || age <= 0) {
            return res.status(400).json({ success: false, message: "Age should be grater than 0" });
        }
        if (!studentClass) {
            return res.status(400).json({ success: false, message: "Class is required" });
        }

        const id = uuidv4();

        await pool.query("insert into students(id,name,age,class)values(?,?,?,?)", [id, name, age, studentClass]);
        const student = { name, age, class: studentClass };
        res.status(201).json({ success: true, student });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, age, class: studentClass } = req.body;

        const [result] = await pool.query("update students set name=?,age=?,class=? where id=?", [name, age, studentClass, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }
        res.json({ sucess: true, student: { id, name, age, class: studentClass } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};


const deletedata = (async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query("delete from students where id=?", [id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: "Student not found" });

        res.json({ success: true, message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});


module.exports = { getdata, insertdata, update, deletedata };