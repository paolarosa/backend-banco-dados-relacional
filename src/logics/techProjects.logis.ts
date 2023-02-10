import { Request, Response } from 'express'
import { QueryConfig } from 'pg'
import format from 'pg-format'
import client from '../databse/config'
import { DeveloperResult, iInfosRequest, iDeveloperRequest, InfosResult, DevelopInfoResult, iProjectRequest, ProjectResult } from '../interfaces/interfaces'


const createProject = async (req: Request, res: Response): Promise<Response> =>{
   const queryAlredyExists: string = `
    SELECT *
    FROM developers
    WHERE id = $1;`;
    let queryConfig: QueryConfig = {
        text: queryAlredyExists,
        values: [req.body.developerId]
    }
  const queryResultExists = await client.query(queryConfig);
if(queryResultExists.rowCount === 0){
    return res.status(404).json({ message: 'Developer not found!'})
}
    const queryString: string = format(
        `
        INSERT INTO projects (%I)
        VALUES (%L)
        RETURNING *;`,
        Object.keys(req.body),
        Object.values(req.body)
    )
    if(!req.body.name || !req.body.description || !req.body.estimatedTime || !req.body.repository||
       !req.body.startDate){
        return res.status(400).json({ message: `Required keys: name, description, estimatedTime, repository, startDate.` });
    } 
    
    const queryResult: ProjectResult = await client.query(queryString)
    return res.status(201).json(queryResult.rows[0])
}

const getProjectsAll = async (req: Request, res: Response): Promise<Response> => {

const queryString=`
SELECT pro.*, ptec."technologyId", tec."name" technologyName
FROM projects pro
LEFT JOIN projects_technologies ptec ON ptec."projectId" = pro.id
LEFT JOIN technologies tec ON ptec."technologyId" = tec.id

;

  ` 
  const queryConfig: QueryConfig = {
    text: queryString,
  }
  const queryResult = await client.query(queryConfig)
  return res.json(queryResult.rows)
}

const getProjects = async (req: Request, res: Response): Promise<Response> => {

  const projectId: number = parseInt(req.params.id)

  const queryString=`
  SELECT pro.*, ptec."technologyId", tec."name" technologyName
  FROM projects pro
  LEFT JOIN projects_technologies ptec ON ptec."projectId" = pro.id
  LEFT JOIN technologies tec ON ptec."technologyId" = tec.id
  WHERE pro.id = $1;`
  
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [projectId]
    }
    const queryResult = await client.query(queryConfig)

    return res.json(queryResult.rows)
  }

  const deleteProject = async (request: Request, response: Response): Promise<Response> => {

    const id: number = parseInt(request.params.id);
    const queryString: string = `
    DELETE FROM projects
    WHERE id = $1;
    `;
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [id],
    };
    const queryResult = await client.query(queryConfig);
    if (!queryResult.rowCount) {
      return response.status(404).json({message: "Project not found!"});
    }
    return response.status(204).send();
  };


  const updateProject = async (req: Request,res: Response): Promise<Response> => {
    const { body, params } = req;
    const updateColumns: any[] = Object.keys(body);
    const updateValues: any[] = Object.values(body);
  
    const queryTemplate: string = `
    UPDATE projects
    SET (%I) = ROW(%L)
    WHERE id = $1
    RETURNING *;
    `;
    const queryFormat: string = format(
      queryTemplate,
      updateColumns,
      updateValues
    );
    const queryConfig: QueryConfig = {
      text: queryFormat,
      values: [params.id],
    };

    if(!req.body.name && !req.body.description && !req.body.estimatedTime && !req.body.repository&&
      !req.body.startDate && !req.body.endDate && !req.body.developerId){
       return res.status(400).json({ message: `Required keys: name, description, estimatedTime, repository, startDate, endDate, developerId.` });
   }
    const queryResult = await client.query(queryConfig);
    return res.status(200).json(queryResult.rows[0]); 
  };


  const getDevelopersProjects = async (req: Request, res: Response): Promise<Response> =>{
    const developId: number = parseInt(req.params.id)
    const queryString=`
    SELECT
    de.*,
    dinf."developerSince",
    dinf."preferredOS",
    pro."id" projectID,
    pro."name" projectName,
    pro."description",
    pro."estimatedTime",
    pro."repository",
    pro."startDate",
    pro."endDate",
    ptec."technologyId",
	tec."name" technologyName
FROM projects pro
    LEFT JOIN developers de ON pro."developerId" = de.id
    LEFT JOIN projects_technologies ptec ON ptec."projectId" = pro.id
    LEFT JOIN developer_infos dinf ON de."infosId" = dinf.id
    LEFT JOIN technologies tec ON ptec."technologyId" = tec.id
WHERE de.id = $1;
    `
  
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [developId]
    }
    const queryResult = await client.query(queryConfig)
    return res.json(queryResult.rows)
    
    }
    const addTechToProject = async (req: Request, res: Response): Promise<Response> =>{
      const projectId: number = parseInt(req.params.id)
      const techName = req.body.name
      if(
      req.body.name !== "JavaScript" && req.body.name !== "Python" && req.body.name !== "React" && req.body.name !== "Express.js" &&
      req.body.name !== "HTML" && req.body.name !== "CSS" && req.body.name !== "Django" && req.body.name !== "PostgreSQL" &&
      req.body.name !== "MongoDB"){
        return res.status(400).json({ message: `Technology must be: Python, React, Express.js, HTML, CSS, Django, PostgreSQL, MongoDB` });
    }
    if(!req.body.name && !req.body.description && !req.body.estimatedTime && !req.body.repository&&
      !req.body.startDate && !req.body.endDate && !req.body.developerId){
       return res.status(400).json({ message: `Required keys: name, description, estimatedTime, repository, startDate, endDate, developerId.` });
   }
      const queryProject=
        `
      SELECT *
      FROM projects
      WHERE id = $1;`
     
      const resultProject = await client.query(queryProject, [projectId])
      const queryTech=`
      SELECT *
      FROM technologies
      WHERE name = $1
      ;
      `
      const resultTech = await client.query(queryTech, [techName])
    const queryString: string = format(
        `
        INSERT INTO projects_technologies ("technologyId", "projectId", "addedIn")
        VALUES ($1, $2, $3)
        RETURNING *;`
    )  
    const queryConfig: QueryConfig = {
      text: queryString,
      values: [resultTech.rows[0].id, resultProject.rows[0].id, new Date().toISOString()]
  } 
  let queryResult: InfosResult = await client.query(queryConfig)
    const queryJoin: string = 
      `SELECT pro.*, ptec."technologyId", tec."name" technologyName
      FROM projects pro
      LEFT JOIN projects_technologies ptec ON ptec."projectId" = pro.id
      LEFT JOIN technologies tec ON ptec."technologyId" = tec.id
      WHERE pro.id = $1;`
    
    let queryResultJoin: InfosResult = await client.query(queryJoin, [req.params.id])
    return res.status(201).json(queryResultJoin.rows)
  }


  const deleteTech = async (req: Request, res: Response): Promise<Response> =>{
    const projectId: number = parseInt(req.params.id)
    const techName = req.params.name
    if(
      req.params.name !== "JavaScript" && req.params.name !== "Python" && req.params.name !== "React" && req.params.name !== "Express.js" &&
      req.params.name !== "HTML" && req.params.name !== "CSS" && req.params.name !== "Django" && req.params.name !== "PostgreSQL" &&
      req.params.name !== "MongoDB"){
        return res.status(404).json({ message: `Technology must be: Python, React, Express.js, HTML, CSS, Django, PostgreSQL, MongoDB` });
    }
    const queryValidate =`
    SELECT FROM projects_technologies AS ptec
    JOIN technologies tec ON ptec."technologyId" = tec.id
    WHERE tec.name = $1 AND "projectId" = $2;
    `
    const resultValidate = await client.query(queryValidate, [techName,projectId])
    if(!resultValidate.rows[0]){
      return res.status(404).json({ message: "Technology not found on this Project."})
    }
    const queryProject=
      `
    SELECT *
    FROM projects
    WHERE id = $1;`
   
    const resultProject = await client.query(queryProject, [projectId])
    const queryTech=`
    SELECT id
    FROM technologies
    WHERE name = $1;
    `
    const resultTech = await client.query(queryTech, [techName])
  const queryString: string = format(
      `
      DELETE FROM projects_technologies 
      WHERE "projectId" = $1 AND "technologyId" = $2;`
  )  
 

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [resultProject.rows[0].id, resultTech.rows[0].id,]
}  

  let queryResult: InfosResult = await client.query(queryConfig)
  return res.status(201).json(queryResult.rows[0])
}



export { createProject, getProjectsAll, getProjects, deleteProject, updateProject, getDevelopersProjects, addTechToProject, deleteTech }