package com.yahoo.imapnio.async.request;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashSet;
import java.util.Set;

import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.yahoo.imapnio.async.exception.ImapAsyncClientException;

/**
 * Unit test for {@link RenameFolderCommand}.
 */
public class RenameFolderCommandTest {
    /** Literal for RENAME. */
    private static final String RENAME = "RENAME ";

    /** Fields to check for cleanup. */
    private Set<Field> fieldsToCheck;

    /**
     * Setup reflection.
     */
    @BeforeClass
    public void setUp() {
        // Use reflection to get all declared non-primitive non-static fields (We do not care about inherited fields)
        final Class<?> classUnderTest = RenameFolderCommand.class;
        fieldsToCheck = new HashSet<>();
        for (Class<?> c = classUnderTest; c != null; c = c.getSuperclass()) {
            for (final Field declaredField : c.getDeclaredFields()) {
                if (!declaredField.getType().isPrimitive() && !Modifier.isStatic(declaredField.getModifiers())) {
                    declaredField.setAccessible(true);
                    fieldsToCheck.add(declaredField);
                }
            }
        }
    }

    /**
     * Tests getCommandLine method.
     * 
     * @throws ImapAsyncClientException will not throw
     * @throws IllegalAccessException will not throw
     * @throws IllegalArgumentException will not throw
     */
    @Test
    public void testGetCommandLine() throws ImapAsyncClientException, IllegalArgumentException, IllegalAccessException {
        final String oldName = "folderABC";
        final String newName = "folderDEF";
        final ImapRequest cmd = new RenameFolderCommand(oldName, newName);
        Assert.assertEquals(cmd.getCommandLine(), "RENAME folderABC folderDEF\r\n", "Expected result mismatched.");

        cmd.cleanup();
        // Verify if cleanup happened correctly.
        for (final Field field : fieldsToCheck) {
            Assert.assertNull(field.get(cmd), "Cleanup should set " + field.getName() + " as null");
        }
    }

    /**
     * Tests getCommandLine method with folder name containing space.
     *
     * @throws ImapAsyncClientException will not throw
     */
    @Test
    public void testGetCommandLineWithEscapeChar() throws ImapAsyncClientException {
        final String oldName = "folder ABC";
        final String newName = "folder DEF";
        final ImapRequest cmd = new RenameFolderCommand(oldName, newName);
        Assert.assertEquals(cmd.getCommandLine(), "RENAME \"folder ABC\" \"folder DEF\"\r\n", "Expected result mismatched.");
    }

    /**
     * Tests getCommandLine method with folder name with other character set encoding.
     *
     * @throws ImapAsyncClientException will not throw
     */
    @Test
    public void testGetCommandLineWithOtherCharSet() throws ImapAsyncClientException {
        final String oldName = "测试";
        final String newName = "folderDEF";
        final ImapRequest cmd = new RenameFolderCommand(oldName, newName);
        Assert.assertEquals(cmd.getCommandLine(), RENAME + "&bUuL1Q- folderDEF\r\n", "Expected result mismatched.");
    }

    /**
     * Tests getCommandType method.
     */
    @Test
    public void testGetCommandType() {
        final ImapRequest cmd = new RenameFolderCommand("oldName", "newName");
        Assert.assertSame(cmd.getCommandType(), ImapRFCSupportedCommandType.RENAME_FOLDER);
    }
}