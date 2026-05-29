import { configureProject } from './app/configure-project'
import { ClackTerminal } from './infra/terminal'
import { FileConfigWriter } from './infra/config-writer'
import { NpmInstaller } from './infra/installer'
import { detectPackageManager } from './infra/pm-detector'
import { printAscii } from './infra/ascii'

printAscii()

const terminal = new ClackTerminal()
const configWriter = new FileConfigWriter()
const installer = new NpmInstaller()
const detectedPm = detectPackageManager()

configureProject(terminal, configWriter, installer, detectedPm)
