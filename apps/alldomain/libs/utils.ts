import { CONFIG } from '@/config/endpoints'
import Papa from 'papaparse'

export function trimWallet(wallet: string) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`.toLowerCase()
}

export function createMessage(address: string, timestamp: number) {
  return `${CONFIG.gameName}-${address}-${timestamp}`
}

export const getFileColumns = (file: File) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const columns = results.data[0]
          resolve(columns)
        } else {
          reject(new Error('No data found in the CSV file'))
        }
      },
      error: (error) => {
        reject(error)
      },
      header: false,
      preview: 1,
    })
  })
}

export const getAddressFromColumn = (file: File, columnName: string) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0]
          // @ts-ignore
          const columnIndex = headers.findIndex((header) => header.toLowerCase().trim() === columnName.toLowerCase().trim())

          if (columnIndex === -1) {
            reject(new Error(`Column "${columnName}" not found in the CSV file`))
            return
          }
          // @ts-ignore
          const columnData = results.data.slice(1).map((row) => row[columnIndex])
          resolve(columnData)
        } else {
          reject(new Error('No data found in the CSV file'))
        }
      },
      error: (error) => {
        reject(error)
      },
      header: false, // Set this to false to get the raw data including headers
    })
  })
}
