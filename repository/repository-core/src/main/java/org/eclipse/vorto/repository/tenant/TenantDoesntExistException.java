/**
 * Copyright (c) 2018 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * https://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */
package org.eclipse.vorto.repository.tenant;

public class TenantDoesntExistException extends RuntimeException {

  /**
   * 
   */
  private static final long serialVersionUID = 2055829944408233458L;

  public static TenantDoesntExistException missingForNamespace(String namespace) {
    return new TenantDoesntExistException("Tenant doesn't exist for namespace '" + namespace + "'");
  }
  
  public static TenantDoesntExistException missingTenant(String tenantId) {
    return new TenantDoesntExistException("Tenant '" + tenantId + "' doesn't exist.");
  }
  
  private TenantDoesntExistException(String msg) {
    super(msg);
  }
  
}
