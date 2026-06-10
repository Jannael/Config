import { printAscii } from '@/ascii'
import { Command } from '@/app/command'
import { GetDependenciesToInstallUseCase } from '@/app/get-dependencies-to-install.use-case'
import { GetFormatterUseCase } from '@/app/get-formatter.use-case'
import { GetLinterUseCase } from '@/app/get-linter.use-case'
import { WriteFormatterConfigUseCase } from '@/app/write-formatter-config.use-case'
import { WriteLinterConfigUseCase } from '@/app/write-linter-config.use-case'
import { Repository } from '@/infra/infra'

printAscii()

const repository = new Repository()
const writeFormatterConfig = new WriteFormatterConfigUseCase(repository)
const writeLinterConfig = new WriteLinterConfigUseCase(repository)
const getDependenciesToInstall = new GetDependenciesToInstallUseCase()
const getLinter = new GetLinterUseCase()
const getFormatter = new GetFormatterUseCase()

const command = new Command(repository, writeFormatterConfig, writeLinterConfig, getDependenciesToInstall, getLinter, getFormatter)

await command.execute()
