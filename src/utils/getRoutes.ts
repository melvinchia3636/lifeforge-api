import fs from 'fs'

interface Route {
    method: string
    path: string
}

interface Routes {
    topLevel: Route[]
    use: {
        path: string
        children: Routes | Route[]
    }[]
}

function getRoutesFromFile(content: string) {
    return content
        .match(/router\.(get|post|put|delete|patch)\((?:\n|\s)*?['"](.+)['"]/g)
        ?.map(e => {
            const match =
                /router\.(get|post|put|delete|patch)\((?:\n|\s)*?['"](.+)['"]/.exec(
                    e
                )

            if (!match) return { method: '', path: '' }

            return {
                method: match[1],
                path: match[2]
            }
        })
}

function getImportStatements(content: string) {
    return Object.fromEntries(
        content
            .match(
                /(?:(import (.+?) from ['"]\.\/routes\/(.+?)['"]))|(?:const (.+?) = lazyLoad\(\(\) => import\(['"]\.\/routes\/(.+?)['"]\)\))/g
            )
            ?.map(e => {
                const match =
                    /(?:import (?<name1>.+?) from ['"]\.\/routes\/(?<path1>.+?)['"])|(?:const (?<name2>.+?) = lazyLoad\(\(\) => import\(['"]\.\/routes\/(?<path2>.+?)['"]\)\))/.exec(
                        e
                    )?.groups

                if (!match) return []

                return [
                    match.name1 ?? match.name2,
                    (match.path1 ?? match.path2)
                        .replace(/\.js$/, '')
                        .replace(/\/index$/, '')
                ]
            }) ?? []
    )
}

function getUseRoutes(content: string, dir: string) {
    const children = Object.fromEntries(
        fs.readdirSync(`${dir}/routes`).map(child => {
            if (fs.lstatSync(`${dir}/routes/${child}`).isDirectory()) {
                return [child, getRoutes(`${dir}/routes/${child}`)]
            }

            const childrenFileContent = fs.readFileSync(
                `${dir}/routes/${child}`,
                'utf8'
            )
            const childrenMatches = getRoutesFromFile(childrenFileContent)
            return [child.replace(/\.ts$/, ''), childrenMatches]
        })
    )

    const importStatements = getImportStatements(content)

    return content
        .match(
            /router\.use\((?:\n|\s)*?['"](.+)['"],(?:\n|\s)+(.*?)(?:\n|\s)*?\)/g
        )
        ?.map(e => {
            const match =
                /router\.use\((?:\n|\s)*?['"](.+)['"],(?:\n|\s)+(.*?)(?:\n|\s)*?\)/.exec(
                    e
                )

            if (!match) return { path: '', children: [] }

            return {
                path: match[1],
                children: children[importStatements[match[2]]]
            }
        })
}

function getRoutes(dir: string, file = 'index.ts') {
    let routes: Routes = {
        topLevel: [],
        use: []
    }

    const indexFileContent = fs.readFileSync(`${dir}/${file}`, 'utf8')

    const topLevelRoutesMatches = getRoutesFromFile(indexFileContent)

    if (topLevelRoutesMatches) {
        routes.topLevel.push(...topLevelRoutesMatches)
    }

    if (!fs.existsSync(`${dir}/routes`)) return routes

    const useRoutesMatches = getUseRoutes(indexFileContent, dir)

    if (useRoutesMatches) {
        routes.use.push(...useRoutesMatches)
    }

    return routes
}

function flattenRoutes(routes: Routes) {
    return [
        ...routes.topLevel,
        ...routes.use.flatMap((e): Route[] =>
            e.children
                ? Array.isArray(e.children)
                    ? e.children.map(c => ({
                          ...c,
                          path: `${e.path}/${c.path}`.replace(/\/\//g, '/')
                      }))
                    : flattenRoutes(e.children).map(c => ({
                          ...c,
                          path: `${e.path}/${c.path}`.replace(/\/\//g, '/')
                      }))
                : []
        )
    ].map(e => ({
        path: e.path.replace(/\/$/g, ''),
        method: e.method.toUpperCase()
    }))
}

export { getRoutes, flattenRoutes }
