import { Request, Response } from 'express'
import { QueryConfig } from 'pg'
import format from 'pg-format'
import client from '../databse/config'
import { DeveloperResult, iInfosRequest, iDeveloperRequest, InfosResult, DevelopInfoResult, iDeveloperKeys, iInfoKeys } from '../interfaces/interfaces'


const createDeveloper = async (req: Request, res: Response): Promise<Response> =>{
    const developerData: iDeveloperRequest = req.body
    const queryAlredyExists: string = `
    SELECT * FROM developers;`;
  const queryResultExists: DeveloperResult = await client.query(queryAlredyExists);

  const validate = queryResultExists.rows.find((el) => {
    return el.email === req.body.email;
  });
  if (validate) {
    return res.status(409).json({ message: `Email already exists` });
  }
    const queryString: string = format(
        `
        INSERT INTO developers (%I)
        VALUES (%L)
        RETURNING *;`,
        Object.keys(developerData),
        Object.values(developerData)
    )
    if(!req.body.name){
        return res.status(400).json({ message: `Missing required keys: name.` });
    }
    const queryResult: DeveloperResult = await client.query(queryString)
    return res.status(201).json(queryResult.rows[0])
}


const createDeveloperInfo = async (req: Request, res: Response): Promise<Response> =>{
    const developerId: number = parseInt(req.params.id)
    const infoData: iInfosRequest = req.body
    if(!req.body.developerSince || !req.body.preferredOS){
      return res.status(400).json({ message: `Required keys: developerSince, preferredOS.` });
  }
    let queryString: string = format(
        `
        INSERT INTO developer_infos (%I)
        VALUES (%L)
        RETURNING *;`, 
        Object.keys(infoData),
        Object.values(infoData)
    )
    let queryResult: InfosResult = await client.query(queryString)
    queryString = `
    UPDATE developers
    SET "infosId" = $1
    WHERE id = $2
    RETURNING *;`

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [queryResult.rows[0].id, developerId]
    }  
    return res.status(201).json(queryResult.rows[0])
}

const getDevelopersAll = async (req: Request, res: Response): Promise<Response> =>{

  const queryString=`
  SELECT dev.id, dev.name, dev.email, dev."infosId", inf."developerSince", inf."preferredOS" 
  FROM developers AS dev
  LEFT JOIN developer_infos inf ON dev."infosId" = inf.id;
  ` 
  const queryConfig: QueryConfig = {
    text: queryString,
  }
  const queryResult: DevelopInfoResult = await client.query(queryConfig)
  return res.json(queryResult.rows)
  
  }

const getDevelopers = async (req: Request, res: Response): Promise<Response> =>{
const developId: number = parseInt(req.params.id)
const queryString=`
SELECT
de.*,
inf."developerSince",
inf."preferredOS"
FROM developers de
LEFT JOIN developer_infos inf ON de."infosId" = inf.id
WHERE de.id = $1;
`
const queryConfig: QueryConfig = {
  text: queryString,
  values: [developId]
}
const queryResult: DevelopInfoResult = await client.query(queryConfig)
if(!queryResult.rowCount){
  return res.status(400).json({ message: `Developer not found.` });
}
return res.json(queryResult.rows[0])

}


const updateDeveloper = async (req: Request,res: Response): Promise<Response> => {
  const { body, params } = req;
  const updateColumns: any[] = Object.keys(body);
  const updateValues: any[] = Object.values(body);

  const queryTemplate: string = `
  UPDATE developers
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

  if (
    !req.body.hasOwnProperty("name") &&
    !req.body.hasOwnProperty("email")
  ) {
    return res 
      .status(400)
      .json({ message: `Required keys are name or email` });
  }
  const queryResult: DeveloperResult = await client.query(queryConfig);
  return res.status(200).json(queryResult.rows[0]); 
};


const updateDeveloperInfo = async (req: Request, res: Response): Promise<Response> =>{
  const developerId: number = parseInt(req.params.id)
  const infoData: iInfosRequest = req.body
  let queryString: string = format(
      `
      SELECT *
      FROM developers
      WHERE id = %s;`,
      developerId
  )
  let queryResult: InfosResult = await client.query(queryString)

 let queryString2: string = format(
  `
  UPDATE developer_infos
  SET (%I) = ROW(%L)
  WHERE id = $1
  RETURNING *;`, 
  Object.keys(infoData),
  Object.values(infoData) 
 )
  const queryConfig2: QueryConfig = {
      text: queryString2,
      values: [queryResult.rows[0].infosId]
  }  
  if (
    !req.body.hasOwnProperty("developerSince") &&
    !req.body.hasOwnProperty("preferredOS")
  ) {
    return res
      .status(400)
      .json({ message: `Required keys are developerSince or preferredOS` });
  }
  const queryResult2 = await client.query(queryConfig2)
  return res.status(201).json(queryResult2.rows[0])
}


const deleteDeveloper = async (request: Request, response: Response): Promise<Response> => {

  const id: number = parseInt(request.params.id);
  const queryString: string = `
  DELETE FROM developers
  WHERE id = $1;
  `;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [id],
  };
  const queryResult = await client.query(queryConfig);
  if (!queryResult.rowCount) {
    return response.status(404).json({message: "Developer not found!"});
  }
  return response.status(204).send();
};


export {createDeveloper, createDeveloperInfo, getDevelopersAll, getDevelopers, updateDeveloper, updateDeveloperInfo, deleteDeveloper}