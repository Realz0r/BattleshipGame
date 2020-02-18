const directoryStatic = __dirname + '/client/src';
const pathBuild = __dirname + '/client/build';

module.exports = {
    mode: 'development',
    context: directoryStatic,
    entry: ['./index.tsx'],
    output: {
        path: pathBuild,
        publicPath: '/',
        filename: 'bundle.js'
    },

    resolve: {
        modules: [directoryStatic, 'node_modules'],
        extensions: [".js", ".ts", ".tsx"]
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            },
            {
                test: /\.less/,
                exclude: /\/node_modules\//,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    }
};
