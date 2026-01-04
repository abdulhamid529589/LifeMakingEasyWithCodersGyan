/**
 * 1. compact conditional return
 */

function hasPermissions(user) {
  // check permissions
  return user.role === "admin" ? true : false; // also like this => return user.role === "admin"

  // bad way
  //   if (user.role === "admin") {
  //     return true;
  //   } else {
  //     return false;
  //   }
}

/**
 * 2. avoid negative boolean naming
 * 
    // use this instead of this => const hasNoPermission = true
    const hasPermission = true;         

    if (!hasPermission) {
        // do something
    }
 */

/**
 * 3. use naming prefixes like (is, has, should, can)
 *
 * const isActive = true    // instead of this => const active = true
 *
 * // Ownership
 * const hasCredits = true
 *
 * // expect
 * const shouldClearCookies = true    // instead of this => clearCookies = true
 *
 *
 * // capability (can)
 *
 * const canUpdate = true     // instead of this => const update = true
 */

/**
 * 4. Avoid redundant comparison
 * 
    // now isLoggedIn is a truthy values in js
    const isLoggedIn = true;

    if (isLoggedIn) {
    // use this instead of this => isLoggedIn === true
    }
 */

/**
 * 5. Logical -> boolean
 *
 * function getDiscount(price, discount){
 *      discount = discount ?? 0.1  // use Nullish coalescing (??) in this type of situation -> instead of discount || 0.1
 *
 *      return price - price * discount
 * }
 *
 * console.log(getDiscount(100, 0))  // 0 percent discount
 */
