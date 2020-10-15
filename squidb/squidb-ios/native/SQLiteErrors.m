/*
 * Copyright (C) 2006-2007 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//
//  SQLiteErrors.m
//  squidb-ios
//  This file extracts portions of AOSP SQLiteCommon.cpp (https://github.com/android/platform_frameworks_base/blob/master/core/jni/android_database_SQLiteCommon.cpp)
//  The core logic/structures defined in the file have been left intact; this is just a translation to use Objective-C
//  syntax instead of C++ to make working with the j2objc tool easier.
//

#import <Foundation/Foundation.h>
#import "SQLiteErrors.h"
#import "SQLiteException.h"
#import "SQLiteDiskIOException.h"
#import "SQLiteDatabaseCorruptException.h"
#import "SQLiteConstraintException.h"
#import "SQLiteAbortException.h"
#import "SQLiteDoneException.h"
#import "SQLiteFullException.h"
#import "SQLiteMisuseException.h"
#import "SQLiteAccessPermException.h"
#import "SQLiteDatabaseLockedException.h"
#import "SQLiteTableLockedException.h"
#import "SQLiteReadOnlyDatabaseException.h"
#import "SQLiteCantOpenDatabaseException.h"
#import "SQLiteBlobTooBigException.h"
#import "SQLiteBindOrColumnIndexOutOfRangeException.h"
#import "SQLiteOutOfMemoryException.h"
#import "SQLiteDatatypeMismatchException.h"
#import "OperationCanceledException.h"

/* throw a SQLiteException with a message appropriate for the error in handle */
void throw_sqlite3_exception_handle(sqlite3* handle) {
    throw_sqlite3_exception_message(handle, NULL);
}

/* throw a SQLiteException with a message appropriate for the error in handle
 concatenated with the given message
 */
void throw_sqlite3_exception_message(sqlite3* handle, const char* message) {
    if (handle) {
        // get the error code and message from the SQLite connection
        // the error message may contain more information than the error code
        // because it is based on the extended error code rather than the simplified
        // error code that SQLite normally returns.
        throw_sqlite3_exception(sqlite3_extended_errcode(handle),
                                sqlite3_errmsg(handle), message);
    } else {
        // we use SQLITE_OK so that a generic SQLiteException is thrown;
        // any code not specified in the switch statement below would do.
        throw_sqlite3_exception(SQLITE_OK, "unknown error", message);
    }
}

/* throw a SQLiteException for a given error code
 * should only be used when the database connection is not available because the
 * error information will not be quite as rich */
void throw_sqlite3_exception_errcode(int errcode, const char* message) {
    throw_sqlite3_exception(errcode, "unknown error", message);
}

/* throw a SQLiteException for a given error code, sqlite3message, and
 user message
 */
void throw_sqlite3_exception(int errcode, const char* sqlite3Message, const char* message) {

    int errcodeMask = errcode & 0xff; /* mask off extended error code */
    if (errcodeMask == SQLITE_DONE) {
        sqlite3Message = NULL; // SQLite error message is irrelevant in this case
    }

    NSString *exceptionMessage;
    if (sqlite3Message) {
        char *zFullmsg = sqlite3_mprintf(
                                         "%s (code %d)%s%s", sqlite3Message, errcode,
                                         (message ? ": " : ""), (message ? message : "")
                                         );
        exceptionMessage = [NSString stringWithUTF8String:zFullmsg];
        sqlite3_free(zFullmsg);
    } else {
        exceptionMessage = [NSString stringWithUTF8String:message];
    }
    switch (errcodeMask) {
        case SQLITE_IOERR:
            @throw [[ComYahooAndroidSqliteSQLiteDiskIOException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_CORRUPT:
        case SQLITE_NOTADB: // treat "unsupported file format" error as corruption also
            @throw [[ComYahooAndroidSqliteSQLiteDatabaseCorruptException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_CONSTRAINT:
            @throw [[ComYahooAndroidSqliteSQLiteConstraintException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_ABORT:
            @throw [[ComYahooAndroidSqliteSQLiteAbortException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_DONE:
            @throw [[ComYahooAndroidSqliteSQLiteDoneException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_FULL:
            @throw [[ComYahooAndroidSqliteSQLiteFullException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_MISUSE:
            @throw [[ComYahooAndroidSqliteSQLiteMisuseException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_PERM:
            @throw [[ComYahooAndroidSqliteSQLiteAccessPermException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_BUSY:
            @throw [[ComYahooAndroidSqliteSQLiteDatabaseLockedException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_LOCKED:
            @throw [[ComYahooAndroidSqliteSQLiteTableLockedException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_READONLY:
            @throw [[ComYahooAndroidSqliteSQLiteReadOnlyDatabaseException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_CANTOPEN:
            @throw [[ComYahooAndroidSqliteSQLiteCantOpenDatabaseException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_TOOBIG:
            @throw [[ComYahooAndroidSqliteSQLiteBlobTooBigException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_RANGE:
            @throw [[ComYahooAndroidSqliteSQLiteBindOrColumnIndexOutOfRangeException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_NOMEM:
            @throw [[ComYahooAndroidSqliteSQLiteOutOfMemoryException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_MISMATCH:
            @throw [[ComYahooAndroidSqliteSQLiteDatatypeMismatchException alloc] initWithNSString:exceptionMessage];
            break;
        case SQLITE_INTERRUPT:
            @throw [[ComYahooAndroidSqliteOperationCanceledException alloc] initWithNSString:exceptionMessage];
            break;
        default:
            @throw [[ComYahooAndroidSqliteSQLException alloc] initWithNSString:exceptionMessage];
            break;
    }
}
