const express = require('express');
const { promises: fs } = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const DB_PATH = path.join(__dirname, 'student.json');

async function readStudents() {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
}

// Route: GET all students
app.get('/students', async (req, res) => {
    try {
        const students = await readStudents();
        res.json(students);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/students', async (req, res) => {
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

        const students = await readStudents();

        const newStudent = {
            id: uuidv4(),
            name: name,
            age: age,
            class: studentClass
        };

        students.push(newStudent);
        await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2));

        res.status(201).json({ success: true, student: newStudent });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.put('/students/:id', async (req, res) => {
    try {
        const { id } = req.params;                  
        const { name, age, class: studentClass } = req.body;

        if (!name || name.length < 3)
            return res.status(400).json({ success: false, message: "Name must be at least 3 characters" });

        if (!age || age <= 0)
            return res.status(400).json({ success: false, message: "Age must be greater than 0" });

        if (!studentClass)
            return res.status(400).json({ success: false, message: "Class is required" });

        const students = JSON.parse(await fs.readFile(DB_PATH, 'utf8') || '[]');

        const student = students.find(s => s.id === id);
        if (!student)
            return res.status(404).json({ success: false, message: "Student not found" });

        student.name = name;
        student.age = age;
        student.class = studentClass;

        await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2));

        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.delete('/students/:id', async (req, res) => {
    try {
        const { id } = req.params; 

        const students = JSON.parse(await fs.readFile(DB_PATH, 'utf8') || '[]');

        const index = students.findIndex(s => s.id === id);
        if (index === -1) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        students.splice(index, 1);
        await fs.writeFile(DB_PATH, JSON.stringify(students, null, 2));

        res.json({ success: true, message: "Student deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.listen(3000, () =>
    console.log("Server running on port 3000"));
