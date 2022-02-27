import {parseHTML} from "./parse";
import {generate} from "./generate";

export function compilerToFunctions(template) {
    // html template => render
    // use ast to describe language, use ast product code
    // virtual dom can describe grammar, but ast describe structure
    // html -> ast -> render

    // 1. html -> ats
    let ast = parseHTML(template)
    console.log(ast)
    // 2. 优化静态节点

    // 3. 通过这棵树，重新生成代码 -> render
    let code = generate(ast);

    // 4. 将字符串变为函数
    // 通过with来限制取值范围，当调用时，能保证取到值
    let render = new Function(`with(this){return ${code}}`);
    return render
}