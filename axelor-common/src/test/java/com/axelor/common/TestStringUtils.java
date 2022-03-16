/*
 * Axelor Business Solutions
 *
 * Copyright (C) 2005-2022 Axelor (<http://axelor.com>).
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package com.axelor.common;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.google.common.base.Joiner;
import org.junit.jupiter.api.Test;

public class TestStringUtils {

  @Test
  public void testIsEmpty() {
    assertTrue(StringUtils.isEmpty(null));
    assertTrue(StringUtils.isEmpty(""));
    assertFalse(StringUtils.isEmpty(" "));
  }

  @Test
  public void testIsBlank() {
    assertTrue(StringUtils.isBlank(null));
    assertTrue(StringUtils.isBlank(""));
    assertTrue(StringUtils.isBlank(" "));
    assertFalse(StringUtils.isBlank("some value"));
  }

  static final String text1 =
      "" + "  this is some text\n" + "  this is some text\n" + "  this is some text\n";

  static final String text2 =
      "" + "  this is some text\n" + "    \tthis is some text\n" + "   this is some text\n";

  static final String text3 =
      "" + "  this is some text\n" + "  this is some text\n" + " this is some text\n";

  static final String text4 =
      "" + "this is some text\n" + "    |this is some text\n" + "    |this is some text\n";

  @Test
  public void testStripIndent() {
    String[] lines = StringUtils.stripIndent(text1).split("\n");
    assertFalse(Character.isWhitespace(lines[0].charAt(0)));
    assertFalse(Character.isWhitespace(lines[1].charAt(0)));
    assertFalse(Character.isWhitespace(lines[2].charAt(0)));
    assertEquals(
        Joiner.on("\n").join(lines),
        "" + "this is some text\n" + "this is some text\n" + "this is some text");

    lines = StringUtils.stripIndent(text2).split("\n");
    assertFalse(Character.isWhitespace(lines[0].charAt(0)));
    assertTrue(Character.isWhitespace(lines[1].charAt(0)));
    assertTrue(Character.isWhitespace(lines[2].charAt(0)));
    assertEquals(
        Joiner.on("\n").join(lines),
        "" + "this is some text\n" + "  \tthis is some text\n" + " this is some text");

    lines = StringUtils.stripIndent(text3).split("\n");
    assertTrue(Character.isWhitespace(lines[0].charAt(0)));
    assertTrue(Character.isWhitespace(lines[1].charAt(0)));
    assertFalse(Character.isWhitespace(lines[2].charAt(0)));
    assertEquals(
        Joiner.on("\n").join(lines),
        "" + " this is some text\n" + " this is some text\n" + "this is some text");
  }

  @Test
  public void testStripMargin() {
    String[] lines = StringUtils.stripMargin(text4).split("\n");
    assertEquals(
        Joiner.on("\n").join(lines),
        "" + "this is some text\n" + "this is some text\n" + "this is some text");
  }

  @Test
  public void testStripAccent() {
    assertEquals(
        "AAAAAACEEEEIIIINOOOOOUUUUY", StringUtils.stripAccent("ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ"));
    assertEquals(
        "aaaaaaceeeeiiiinooooouuuuyy", StringUtils.stripAccent("àáâãäåçèéêëìíîïñòóôõöùúûüýÿ"));
    assertEquals("L", StringUtils.stripAccent("Ł"));
    assertEquals("l", StringUtils.stripAccent("ł"));
    assertEquals("Cesar", StringUtils.stripAccent("César"));
    assertEquals("Andre", StringUtils.stripAccent("André"));
  }
}
