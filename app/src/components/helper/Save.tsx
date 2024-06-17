import * as React from 'react'
import { connect } from 'react-redux'
import Check from '@material-ui/icons/Check'
import CustomIconButton from './CustomIconButton'

import { SaveAlt } from '@material-ui/icons'
import { bindActionCreators } from 'redux'
import { rendererRpc, writeToFile } from '../../../../events'
import { makeSaveDialogRpc } from '../../../../events/OpenDialogRequest'

import { globalActions } from '../../actions'

export async function saveToFile(data: string): Promise<string | undefined> {
  const rejectReasons = {
    errorWritingFile: 'Error writing file',
  }

  const { canceled, filePath } = await rendererRpc.call(makeSaveDialogRpc(), {
    securityScopedBookmarks: true,
  })

  if (!canceled && filePath !== undefined) {
    try {
      const filename = await rendererRpc.call(writeToFile, { filePath, data })
      return filePath
    } catch (error) {
      throw rejectReasons.errorWritingFile
    }
  }
}

interface Props {
  getData: () => string | undefined
  actions: {
    global: typeof globalActions
  }
}

interface State {
  didSave: boolean
}

class Save extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { didSave: false }
  }

  private handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation()
    const data = this.props.getData()
    if (data != undefined) {
      const filename = await saveToFile(data)
      this.props.actions.global.showNotification(`Saved to ${filename}`)
      this.setState({ didSave: true })
      setTimeout(() => {
        this.setState({ didSave: false })
      }, 1500)
    }
  }

  public render() {
    const icon = !this.state.didSave ? (
      <SaveAlt fontSize="inherit" />
    ) : (
      <Check fontSize="inherit" style={{ cursor: 'default' }} />
    )

    return (
      <CustomIconButton onClick={this.handleClick} tooltip="Save to file">
        <div style={{ marginTop: '2px' }}>{icon}</div>
      </CustomIconButton>
    )
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    actions: {
      global: bindActionCreators(globalActions, dispatch),
    },
  }
}

export default connect(undefined, mapDispatchToProps)(Save)
