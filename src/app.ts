import express, { Application } from 'express'
import startDatabase from './databse/connection'
import { createDeveloper, createDeveloperInfo, deleteDeveloper, getDevelopers, getDevelopersAll, updateDeveloper, updateDeveloperInfo } from './logics/developerInfos.logic'
import { addTechToProject, createProject, deleteProject, deleteTech, getDevelopersProjects, getProjects, getProjectsAll, updateProject } from './logics/techProjects.logis'
import { ensureDevelopExists, ensureProjectExists, validateKeysNameEmail, validateProjectKeys, validateSincePreferKeys } from './middlewares/mid.develop'

const app: Application = express()
app.use(express.json())

app.post("/developers", validateKeysNameEmail, createDeveloper);
app.post("/developers/:id/infos", ensureDevelopExists, validateSincePreferKeys, createDeveloperInfo);
app.get("/developers", getDevelopersAll);
app.get("/developers/:id",ensureDevelopExists, getDevelopers);
app.patch("/developers/:id",ensureDevelopExists, validateKeysNameEmail, updateDeveloper);
app.patch("/developers/:id/infos",ensureDevelopExists,validateSincePreferKeys, updateDeveloperInfo);
app.delete("/developers/:id", deleteDeveloper);

app.post("/projects",validateProjectKeys, createProject);
app.get("/projects", getProjectsAll);
app.get("/projects/:id", ensureProjectExists, getProjects);
app.delete("/projects/:id", deleteProject)
app.patch("/projects/:id", ensureProjectExists,validateProjectKeys, updateProject)
app.get("/developers/:id/projects",ensureDevelopExists, getDevelopersProjects);
app.post("/projects/:id/technologies",ensureProjectExists, addTechToProject)
app.delete("/projects/:id/technologies/:name",ensureProjectExists, deleteTech)


app.listen(3000, async () => {
    console.log('Server is running!')
    await startDatabase()
})