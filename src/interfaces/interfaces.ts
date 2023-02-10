import { QueryResult } from 'pg'

interface iDeveloperRequest {
    name: string,
    email: string,
}
interface iDeveloper extends iDeveloperRequest {
    id: number
}
type DeveloperResult = QueryResult<iDeveloper>

type iDeveloperKeys = "name" | "email";

interface iInfosRequest {
    developerSince: string,
    preferredOS: string,
    infosId: string
}
interface iInfos extends iInfosRequest {
    id: number
}
type iInfoKeys = "developerSince" | "preferredOS";
type InfosResult = QueryResult<iInfos>

type DevelopInfo = iDeveloper & iInfosRequest
type DevelopInfoResult = QueryResult<DevelopInfo>

interface iDeveloperInfo extends iDeveloper {
    developerSince: string,
    preferredOS: string,
}

interface iProjectRequest{
    name: string,
    description: string,
    estimatedTime: string,
    repository: string,
    startDate: string,
    developerId?: number,
}
interface iProject extends iProjectRequest {
    id: number
}
type iProjectKeys = "name" | "description" | "estimatedTime" | "repository" | "startDate" | "developerId";
type ProjectResult = QueryResult<iProject>



export {
iDeveloperRequest,
iDeveloper,
DeveloperResult,
iInfosRequest,
iInfos,
InfosResult,
iDeveloperInfo,
DevelopInfoResult,
iProjectRequest,
ProjectResult,
iDeveloperKeys,
iInfoKeys,
iProjectKeys}