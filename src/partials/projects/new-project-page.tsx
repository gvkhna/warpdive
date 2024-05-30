import {Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from '@/components/ui/card'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {Label} from '@/components/ui/label'
import {useNavigate} from 'react-router-dom'
import {useState, type ClipboardEvent, type ChangeEvent} from 'react'
import api from '@/lib/api-client'

export function NewProjectPage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [showNameError, setShowNameError] = useState(false)

  const parseNameFromUrl = (e: ClipboardEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>) => {
    console.log('setting new url: ', e.currentTarget.value)
    setUrl(e.currentTarget.value)
    try {
      const url_ = new URL(e.currentTarget.value)
      const pathComponents = url_.pathname.split('/').filter((component) => component !== '')
      const newName = pathComponents.length >= 2 ? pathComponents[1] : null
      if (newName) {
        setName(newName.toLowerCase())
      }
    } catch (err) {
      // ignore error
      console.log(err)
    }
  }

  const submitForm = async () => {
    const res = await api.projects.new.$post({
      json: {
        name,
        url
      }
    })

    if (res.ok) {
      const json = await res.json()
      navigate(`/app/project/${json.project.pid}`)
    } else {
      const json = await res.json()
      if ('message' in json && json.message) {
        throw new Error(json.message)
      } else {
        throw new Error('An unknown error occurred while fetching the data.')
      }
    }
  }

  return (
    <div className='border-b'>
      <div className='container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10'>
        <div></div>
        <main className='relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]'>
          <div className='mx-auto w-full min-w-0'>
            <Card>
              <CardHeader>
                <CardTitle>Create project</CardTitle>
                <CardDescription>Projects group your container deployments to your repo</CardDescription>
              </CardHeader>
              <CardContent>
                {/* <form method='post' action='/api/projects/new'> */}
                <div className='grid w-full items-center gap-4'>
                  <div className='flex flex-col space-y-1.5'>
                    <Label htmlFor='url'>Project Repository Url</Label>
                    <Input
                      id='url'
                      type={'url'}
                      placeholder='https://github.com/gvkhna/warpdive'
                      required={true}
                      value={url}
                      onPaste={(e) => {
                        parseNameFromUrl(e)
                      }}
                      onChange={(e) => {
                        parseNameFromUrl(e)
                      }}
                    />
                  </div>
                  <div className='flex flex-col space-y-1.5'>
                    <Label htmlFor='url'>Project name</Label>
                    <Input
                      id='name'
                      type={'text'}
                      placeholder='warpdive'
                      required={true}
                      value={name}
                      onChange={(e) => {
                        setName(e.currentTarget.value)
                      }}
                    />
                    {showNameError && (
                      <p className='text-sm font-medium text-destructive'>Project must have a valid name, no spaces</p>
                    )}
                  </div>
                </div>
                {/* </form> */}
              </CardContent>
              <CardFooter className='flex justify-between'>
                <Button
                  variant='outline'
                  onClick={() => {
                    navigate('/app/')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!name || name.includes(' ')) {
                      setShowNameError(true)
                      return
                    }
                    submitForm()
                  }}
                >
                  Create
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
