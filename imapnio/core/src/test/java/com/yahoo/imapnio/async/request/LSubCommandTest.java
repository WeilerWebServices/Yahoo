package com.yahoo.imapnio.async.request;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashSet;
import java.util.Set;

import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import com.sun.mail.imap.protocol.IMAPResponse;
import com.yahoo.imapnio.async.exception.ImapAsyncClientException;

/**
 * Unit test for {@link LSubCommand}.
 */
public class LSubCommandTest {

    /** Fields to check for cleanup. */
    private Set<Field> fieldsToCheck;

    /**
     * Setup reflection.
     */
    @BeforeClass
    public void setUp() {
        // Use reflection to get all declared non-primitive non-static fields (We do not care about inherited fields)
        final Class<?> classUnderTest = LSubCommand.class;
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
        final ImapRequest cmd = new LSubCommand("", "*test*");
        Assert.assertEquals(cmd.getCommandLine(), "LSUB \"\" \"*test*\"\r\n", "Expected result mismatched.");

        cmd.cleanup();
        // Verify if cleanup happened correctly.
        for (final Field field : fieldsToCheck) {
            Assert.assertNull(field.get(cmd), "Cleanup should set " + field.getName() + " as null");
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
    public void testGetCommandLineReferenceExists()
            throws ImapAsyncClientException, IllegalArgumentException, IllegalAccessException {
        final ImapRequest cmd = new LSubCommand("~smith/Mail/", "foo.*");
        Assert.assertEquals(cmd.getCommandLine(), "LSUB ~smith/Mail/ \"foo.*\"\r\n", "Expected result mismatched.");

        cmd.cleanup();
        // Verify if cleanup happened correctly.
        for (final Field field : fieldsToCheck) {
            Assert.assertNull(field.get(cmd), "Cleanup should set " + field.getName() + " as null");
        }
    }

    /**
     * Tests getStreamingResponsesQueue method.
     */
    @Test
    public void testGetStreamingResponsesQueue() {
        final ImapRequest cmd = new LSubCommand("", "*test*");
        Assert.assertNull(cmd.getStreamingResponsesQueue(), "Expected result mismatched.");
    }

    /**
     * Tests getNextCommandLineAfterContinuation method.
     */
    @Test
    public void testGetNextCommandLineAfterContinuation() {
        final ImapRequest cmd = new LSubCommand("", "*test*");
        final IMAPResponse serverResponse = null; // null or not null does not matter
        ImapAsyncClientException ex = null;
        try {
            cmd.getNextCommandLineAfterContinuation(serverResponse);
        } catch (final ImapAsyncClientException imapAsyncEx) {
            ex = imapAsyncEx;
        }
        Assert.assertNotNull(ex, "Expect exception to be thrown.");
        Assert.assertEquals(ex.getFailureType(), ImapAsyncClientException.FailureType.OPERATION_NOT_SUPPORTED_FOR_COMMAND,
                "Expected result mismatched.");
    }

    /**
     * Tests getTerminateCommandLine method.
     */
    @Test
    public void testGetTerminateCommandLine() {
        final ImapRequest cmd = new LSubCommand("", "*test*");
        ImapAsyncClientException ex = null;
        try {
            cmd.getTerminateCommandLine();
        } catch (final ImapAsyncClientException imapAsyncEx) {
            ex = imapAsyncEx;
        }
        Assert.assertNotNull(ex, "Expect exception to be thrown.");
        Assert.assertEquals(ex.getFailureType(), ImapAsyncClientException.FailureType.OPERATION_NOT_SUPPORTED_FOR_COMMAND,
                "Expected result mismatched.");
    }

    /**
     * Tests getCommandType method.
     */
    @Test
    public void testGetCommandType() {
        final ImapRequest cmd = new LSubCommand("", "*test*");
        Assert.assertSame(cmd.getCommandType(), ImapRFCSupportedCommandType.LSUB);
    }
}