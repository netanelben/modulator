const select = (e) => document.querySelector(`.${e}`)
const click = (e, callback) => e.addEventListener('click', callback)

click(select('add-btn'), () => {
    MakeItHappen(3)
})
