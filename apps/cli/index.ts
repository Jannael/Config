import { ConfigureProject } from '@/app/command'
import { FileConfigRepository } from '@/infra/config-repository'
import { printAscii } from '@/ascii'

printAscii()

const repo = new FileConfigRepository()
new ConfigureProject(repo).execute()
