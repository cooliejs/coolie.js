/**
 * coolie.js 声明文件
 * @author ydr.me
 * @created 2016年12月27日11:24:59
 */

interface coolieModuleExports {

}

interface coolieModule {
    exports: coolieModuleExports
}

interface coolie {

}

interface coolieRequire{
    (path: String, pipe?: String): coolieModuleExports,
    async(path: String, callback: Function): void
}

declare const require: coolieRequire;
declare const module: coolieModule;
declare const exports: coolieModuleExports;

