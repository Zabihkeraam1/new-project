const mongoose = require('mongoose');
const projectModel = new mongoose.Schema({
    name: { type: String, required: true },
    processId: { type: Number, required: true },
    port: { type: Number, required: true },
    url: { type: String, required: true },
    nginxUrl: { type: String, required: true },
    repoUrl: { type: String, required: true },
    status: { type: String, required: true, enum: ['active', 'inactive'] }
})

const Project = mongoose.model('Project', projectModel);
module.exports = Project;