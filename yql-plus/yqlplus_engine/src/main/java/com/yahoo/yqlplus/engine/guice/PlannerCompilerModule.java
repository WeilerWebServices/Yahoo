/*
 * Copyright (c) 2016 Yahoo Inc.
 * Licensed under the terms of the Apache version 2.0 license.
 * See LICENSE file for terms.
 */

package com.yahoo.yqlplus.engine.guice;

import com.google.inject.AbstractModule;
import com.google.inject.Key;
import com.google.inject.multibindings.OptionalBinder;
import com.yahoo.yqlplus.engine.ProgramCompiler;
import com.yahoo.yqlplus.engine.internal.bytecode.ASMClassSourceModule;
import com.yahoo.yqlplus.engine.internal.compiler.PlanProgramCompiler;
import com.yahoo.yqlplus.engine.internal.compiler.streams.PlanProgramCompileOptions;
import com.yahoo.yqlplus.engine.internal.plan.PlanScopedModule;

public class PlannerCompilerModule extends AbstractModule {

    @Override
    protected void configure() {
        OptionalBinder.newOptionalBinder(binder(), Key.get(PlanProgramCompileOptions.class))
                .setDefault().toInstance(PlanProgramCompileOptions.DEFAULT_OPTIONS);
        bind(ProgramCompiler.class).to(PlanProgramCompiler.class);
        install(new PlanScopedModule());
        install(new ASMClassSourceModule());
    }
}
