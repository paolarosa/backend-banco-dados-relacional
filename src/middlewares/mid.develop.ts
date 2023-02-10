import { NextFunction, Request, Response } from 'express'
import { QueryConfig } from 'pg'
import client from '../databse/config'
import { iDeveloperKeys, iInfoKeys, iProjectKeys } from '../interfaces/interfaces'

const ensureDevelopExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const developerId: number = parseInt(req.params.id)
    const queryString: string = `
    SELECT COUNT(*)
    FROM developers
    WHERE id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [developerId]
    }

    const queryResult = await client.query(queryConfig)
    if(Number(queryResult.rows[0].count) > 0){
        return next()
    }
    return res.status(404).json({ message: `Developer not found.` })
}

const ensureProjectExists = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {

    const projectId: number = parseInt(req.params.id)
    const queryString: string = `
    SELECT COUNT(*)
    FROM projects
    WHERE id = $1;
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    }

    const queryResult = await client.query(queryConfig)
    if(Number(queryResult.rows[0].count) > 0){
        return next()
    }
    return res.status(404).json({ message: `Project not found.` })
}

const validateKeysNameEmail = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const keys: Array<string> = Object.keys(req.body)
    const requiredKeys: Array<iDeveloperKeys> = ['name', 'email']
    const containsAllRequired: boolean = keys.every((key: any) => {return requiredKeys.includes(key)}) 
    if(!containsAllRequired){
      keys.map((el:any)=>{
        el !== "name" && el !== "email" && delete req.body[`${el}`]
      })
    }
        return next()
}

const validateSincePreferKeys = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const keys: Array<string> = Object.keys(req.body)
    const requiredKeys: Array<iInfoKeys> = ['developerSince', 'preferredOS']
    const containsAllRequired: boolean = keys.every((key: any) => {return requiredKeys.includes(key)}) 
     console.log(requiredKeys)
    if(!containsAllRequired){
      keys.map((el:any)=>{
        el !== "developerSince" && el !== "preferredOS" && delete req.body[`${el}`]
      })
    }
    return next()
}

const validateProjectKeys = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    const keys: Array<string> = Object.keys(req.body)
    const requiredKeys: Array<iProjectKeys> = ['name', 'description', 'estimatedTime', 'repository', 'startDate', 'developerId']
    const containsAllRequired: boolean = keys.every((key: any) => {return requiredKeys.includes(key)}) 
     console.log(requiredKeys)
    if(!containsAllRequired){
      keys.map((el:any)=>{
        el !== "name" && el !== "description" && el !== "estimatedTime" && el !== "repository" && el !== "startDate" && el !== "developerId"
        && delete req.body[`${el}`]
      })
    }
    return next()
}


export { ensureDevelopExists, ensureProjectExists, validateKeysNameEmail, validateSincePreferKeys, validateProjectKeys }