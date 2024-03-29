import React, { Component } from 'react'
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Land from '../contracts/LandRegistry.json'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Slide from '@material-ui/core/Slide'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})
const columns = [
  { id: 'property', label: 'Property ID', minWidth: 100 },
  { id: 'name', label: 'Full Name', minWidth: 100 },

  {
    id: 'laddress',
    label: 'Land Details',
    minWidth: 170,
  },

  {
    id: 'lstate',
    label: 'State',
    minWidth: 100,
  },
  {
    id: 'lcity',
    label: 'City',
    minWidth: 100,
  },

  {
    id: 'lamount',
    label: 'Total Amount (in ETH)',
    minWidth: 100,
  },
  {
    id: 'document',
    label: 'Documents',
    minWidth: 100,
  },
  {
    id: 'images',
    label: 'Land Images',
    minWidth: 100,
  },
  {
    id: 'isGovtApproved',
    label: 'Status of Land Approval (by the Govt.)',
    minWidth: 100,
  },
  {
    id: 'isAvailable',
    label: 'Land Availability Status',
    minWidth: 100,
  },
]

const styles = (theme) => ({
  root: {
    width: '100%',
  },
})

class table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      assetList: [],
      isLoading: true,
      images: [],
      open1: false,
    }
  }

  componentDidMount = async () => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    await window.localStorage.setItem('web3account', accounts[0])
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const LandContract = Land.networks[networkId]

    if (LandContract) {
      const LandContractMethods = new web3.eth.Contract(Land.abi, LandContract.address)
      this.setState({ LandContractMethods })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
    
    const user = await this.state.LandContractMethods.methods.getUser(accounts[0]).call()
    this.setState({
      uid: user[0],
      uname: user[1],
      ucontact: user[2],
      uemail: user[3],
      ucode: user[4],
      ucity: user[5],
      exist: user[6],
    })
  }

  handleRequest = async (id) => {
    await this.state.LandContractMethods.methods.requstToLandOwner(id).send({
      from: this.state.account,
      gas: 1000000,
    })
    window.location.reload()
  }

  handleBuy = async (id, amount) => {
    amount = amount * 1000000000000000000
    let mValue = parseInt(amount)
    let StringValue = mValue.toString()
    await this.state.LandContractMethods.methods.buyProperty(id).send({
      from: this.state.account,
      value: StringValue,
    })

    window.location.reload()
  }

  handleViewImages = async (images) => {
    this.setState({ open1: true })

    if (images) {
      this.setState({
        images: images,
      })
    }
  }
  
  handleClose1 = () => {
    this.setState({ open1: false })
  }

  render() {
    const { classes, assetList } = this.props
    return (
      <Paper className={classes.root}>
        <TableContainer className={classes.container}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    <b>{column.label}</b>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assetList.map((row, index) => {
                return (
                  <TableRow hover role="checkbox" key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id]
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.id === 'isAvailable' && value === 'Available' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                this.handleRequest(row['property'])
                              }
                            >
                              Request to Buy
                            </Button>
                          ) : 
                        column.id === 'isAvailable' && value === 'GovtApproved' ? (
                            <div>Unavailable</div>
                          ) : 
                          column.id === 'isAvailable' && value === 'Approved' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                this.handleBuy(row['property'], row['lamount'])
                              }
                            >
                              Buy
                            </Button>
                          ) : 
                          column.id == 'document' ? (
                            <a href={row['document']} download>
                              Download Document
                            </a>
                          ) : 
                          column.id == 'images' ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                this.handleViewImages(row['images'])
                              }
                            >
                              View Images
                            </Button>
                          ) : 
                          (value)}
                          <Dialog
                            open={this.state.open1}
                            TransitionComponent={Transition}
                            keepMounted
                            onClose={this.handleClose1}
                            aria-labelledby="alert-dialog-slide-title"
                            aria-describedby="alert-dialog-slide-description"
                          >
                            <DialogTitle
                              id="alert-dialog-slide-title"
                              style={{ textAlign: 'center' }}
                            >
                              {'View Images'}
                            </DialogTitle>
                            <DialogContent>
                              <DialogContentText id="alert-dialog-slide-description">
                                {this.state.images.map((image) => (
                                  <img
                                    src={image}
                                    style={{
                                      height: '300px',
                                      width: '400px',
                                      margin: '10px',
                                    }}
                                  />
                                ))}
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button
                                onClick={this.handleClose1}
                                color="primary"
                              >
                                Close
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )
  }
}
export default withStyles(styles)(table)
