package com.yahoo.imapnio.async.response;

import java.util.Collection;

import com.sun.mail.imap.protocol.IMAPResponse;

/**
 * This class defines the Response for IMAP asynchronous requests.
 */
public class ImapAsyncResponse {
    /** List of IMAPResponse lines. */
    private Collection<IMAPResponse> responses;

    /**
     * Initializes an {@link ImapAsyncResponse} object.
     *
     * @param responses list of response lines
     */
    public ImapAsyncResponse(final Collection<IMAPResponse> responses) {
        this.responses = responses;
    }

    /**
     * @return list of IMAPResponse lines.
     */
    public Collection<IMAPResponse> getResponseLines() {
        return responses;
    }
}
