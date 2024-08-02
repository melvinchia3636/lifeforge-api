import * as express from 'express'
import Pocketbase from 'pocketbase'

declare global {
    namespace Express {
        interface Request {
            pb: Pocketbase
        }
    }
}
