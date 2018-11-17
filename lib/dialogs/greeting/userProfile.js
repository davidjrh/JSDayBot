"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple object used by the user state property accessor.
 * Used to store the user state.
 */
class UserProfile {
    /**
     * Constructor. Members initialized with undefined,
     *  if no values provided via constructor
     *
     * @param name string
     * @param city string
     */
    constructor(name, city) {
        this.name = name || undefined;
        this.city = city || undefined;
    }
}
exports.UserProfile = UserProfile;
;
//# sourceMappingURL=userProfile.js.map