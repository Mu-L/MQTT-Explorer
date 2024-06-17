import { ConnectionOptions, createEmptyConnection } from './ConnectionOptions'

interface LegacyConnectionSettings {
  host: string
  protocol: string
  port: number
  tls: boolean
  certValidation: boolean
  clientId: string
  connectionId?: string
  username: string
  password: string
}

export function clearLegacyConnectionOptions() {
  window.localStorage.setItem('connectionSettings', '')
}

export function loadLegacyConnectionOptions(): { [s: string]: ConnectionOptions } | {} {
  const legacySettingsString = window.localStorage.getItem('connectionSettings')
  if (!legacySettingsString) {
    return {}
  }

  let legacyConnection
  try {
    legacyConnection = JSON.parse(legacySettingsString) as LegacyConnectionSettings
  } catch {
    return {}
  }

  const protocolMap: { [s: string]: string } = {
    'tcp://': 'mqtt',
    'ws://': 'ws',
    'mqtt://': 'mqtt',
  }

  const migratedOptions: Partial<ConnectionOptions> = {
    certValidation: legacyConnection.certValidation,
    host: legacyConnection.host,
    name: legacyConnection.host,
    protocol: protocolMap[legacyConnection.protocol] as any,
    port: legacyConnection.port,
    username: legacyConnection.username,
    password: legacyConnection.password,
    clientId: legacyConnection.clientId,
    encryption: legacyConnection.tls,
  }

  const emptyConnection = createEmptyConnection()

  return {
    [emptyConnection.id]: {
      ...emptyConnection,
      ...migratedOptions,
    },
  }
}
