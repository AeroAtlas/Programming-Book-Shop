const deleteProduct = (btn) => {
  const prodId = btn.parentNode.querySelector("[name=productId").value
  const csrf = btn.parentNode.querySelector("[name=_csrf").value

  const prodEl = btn.closest("article")

  fetch("/admin/product/"+prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log(data)
    prodEl.remove()
    //prodEl.parentNode.removeChild(productElement) //for IE
  })
  .catch(err => console.log(err))
}