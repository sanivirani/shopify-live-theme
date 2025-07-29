// // this file code is only quick view modal 




// let customQuickViewHandle = "";

// function openCustomQuickView(handle) {
//   customQuickViewHandle = handle;
//   const modal = document.getElementById("customQuickViewModal");
//   const content = document.getElementById("customQuickViewContent");
//   modal.classList.add("open");
//   content.innerHTML = `
//       <button class="custom-modal-close" onclick="closeCustomQuickView()">×</button>
//       <div class="custom-loading">Loading...</div>`;

//   fetch(`/products/${handle}.js`)
//     .then((res) => res.json())
//     .then((product) => {
//       const variantSelectors = product.options
//         .map((option, i) => {
//           const values = product.variants
//             .map((v) => v.options[i])
//             .filter((v, idx, arr) => arr.indexOf(v) === idx);

//           return `
//             <div class="custom-variant-option">
//               <label>${option}</label>
//               <select data-option-index="${i}" onchange="customUpdateVariant(event)">
//                 ${values
//                   .map((val) => `<option value="${val}">${val}</option>`)
//                   .join("")}
//               </select>
//             </div>`;
//         })
//         .join("");

//       const firstVariantId = product.variants[0].id;

//       content.innerHTML = `
//           <button class="custom-modal-close" onclick="closeCustomQuickView()">×</button>
//           <img src="${product.images[0]}" alt="${
//         product.title
//       }" class="custom-product-image" />
//           <h2>${product.title}</h2>
//           <p>$${(product.price / 100).toFixed(2)}</p>
//           <div>${variantSelectors}</div>
//           <form method="post" action="/cart/add">
//             <input type="hidden" name="id" id="customQuickViewVariantId" value="${firstVariantId}">
//             <button type="submit" class="custom-btn custom-quick-add-button">Add to Cart</button>
//           </form>`;
//     });
// }

// function closeCustomQuickView() {
//   document.getElementById("customQuickViewModal").classList.remove("open");
// }

// function customUpdateVariant(event) {
//   const selects = document.querySelectorAll(".custom-variant-option select");
//   const selected = Array.from(selects).map((sel) => sel.value);

//   fetch(`/products/${customQuickViewHandle}.js`)
//     .then((res) => res.json())
//     .then((product) => {
//       const matched = product.variants.find((v) =>
//         v.options.every((opt, i) => opt === selected[i])
//       );
//       if (matched) {
//         document.getElementById("customQuickViewVariantId").value = matched.id;
//       }
//     });
// }
