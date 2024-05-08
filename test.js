


async function test() {
    return 1
}

console.log(test())

async function test1() {
    console.log(await test())
}

test1()