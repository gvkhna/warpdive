import {PropsWithChildren} from 'react'
import {useParams} from 'react-router-dom'
export interface ProjectsPageProps {}

export default function ProjectsPage({children}: PropsWithChildren<ProjectsPageProps>) {
  const {pid} = useParams()
  return <h1>Dashboard</h1>
}
